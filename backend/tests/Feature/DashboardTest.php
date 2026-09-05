<?php

namespace Tests\Feature;

use App\Actions\Board\CreateBoardAction;
use App\Actions\Card\CreateCardAction;
use App\Actions\Project\CreateProjectAction;
use App\Actions\Workspace\CreateWorkspaceAction;
use App\Enums\CardPriority;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Cobre a correção do DashboardController: antes usava
 * where('project_id', $subqueryBuilder), que só funcionava por acidente
 * com um único projeto. Este teste cria DOIS projetos/boards no mesmo
 * workspace para provar que a contagem agrega os dois corretamente.
 */
class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_aggregates_cards_across_multiple_projects(): void
    {
        $owner = User::factory()->create();
        $workspace = app(CreateWorkspaceAction::class)->execute($owner, 'WS');

        $projectA = app(CreateProjectAction::class)->execute($owner, $workspace, 'Projeto A');
        $projectB = app(CreateProjectAction::class)->execute($owner, $workspace, 'Projeto B');

        $boardA = app(CreateBoardAction::class)->execute($owner, $projectA, 'Board A');
        $boardB = app(CreateBoardAction::class)->execute($owner, $projectB, 'Board B');

        app(CreateCardAction::class)->execute($owner, $boardA->columns()->first(), [
            'title' => 'Card A1', 'priority' => CardPriority::High->value,
        ]);
        app(CreateCardAction::class)->execute($owner, $boardB->columns()->first(), [
            'title' => 'Card B1', 'priority' => CardPriority::Low->value,
        ]);
        app(CreateCardAction::class)->execute($owner, $boardB->columns()->first(), [
            'title' => 'Card B2', 'priority' => CardPriority::Low->value,
        ]);

        $response = $this->actingAs($owner, 'sanctum')
            ->getJson("/api/v1/workspaces/{$workspace->id}/dashboard")
            ->assertOk();

        // Os 3 cards, de AMBOS os projetos, precisam ser contados.
        $response->assertJson(['total' => 3]);

        $byProject = collect($response->json('by_project'))->keyBy('name');
        $this->assertSame(1, $byProject['Projeto A']['total']);
        $this->assertSame(2, $byProject['Projeto B']['total']);
    }
}
