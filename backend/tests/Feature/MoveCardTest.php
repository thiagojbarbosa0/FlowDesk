<?php

namespace Tests\Feature;

use App\Actions\Board\CreateBoardAction;
use App\Actions\Card\CreateCardAction;
use App\Actions\Project\CreateProjectAction;
use App\Actions\Workspace\CreateWorkspaceAction;
use App\Enums\WorkspaceRole;
use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MoveCardTest extends TestCase
{
    use RefreshDatabase;

    private User $member;
    private Column $first;
    private Column $second;
    private Board $otherBoard;
    private Column $otherBoardColumn;

    public function setUp(): void
    {
        parent::setUp();

        $owner = User::factory()->create();
        $workspace = app(CreateWorkspaceAction::class)->execute($owner, 'WS');
        $this->member = User::factory()->create();
        $workspace->memberships()->create(['user_id' => $this->member->id, 'role' => WorkspaceRole::Member]);

        $project = app(CreateProjectAction::class)->execute($owner, $workspace, 'P');
        $board = app(CreateBoardAction::class)->execute($owner, $project, 'Board 1');
        $columns = $board->columns()->orderBy('position')->get();
        $this->first = $columns[0];
        $this->second = $columns[1];

        $this->otherBoard = app(CreateBoardAction::class)->execute($owner, $project, 'Board 2');
        $this->otherBoardColumn = $this->otherBoard->columns()->first();
    }

    private function createCard(Column $column, string $title): int
    {
        return app(CreateCardAction::class)->execute($this->member, $column, ['title' => $title])->id;
    }

    public function test_move_reindexes_column_with_stable_gaps(): void
    {
        $c1 = $this->createCard($this->first, 'A');
        $c2 = $this->createCard($this->first, 'B');
        $c3 = $this->createCard($this->first, 'C');

        $this->actingAs($this->member, 'sanctum')
            ->postJson("/api/v1/cards/{$c3}/move", [
                'column_id' => $this->first->id,
                'position' => 0,
            ])->assertOk();

        $ordered = $this->first->cards()->orderBy('position')->pluck('id')->toArray();
        $this->assertSame([$c3, $c1, $c2], $ordered);

        $positions = $this->first->cards()->orderBy('position')->pluck('position')->toArray();
        $this->assertSame([100, 200, 300], $positions);
    }

    public function test_move_across_columns(): void
    {
        $c1 = $this->createCard($this->first, 'A');
        $this->createCard($this->first, 'B');
        $b1 = $this->createCard($this->second, 'X');
        $this->createCard($this->second, 'Y');

        $this->actingAs($this->member, 'sanctum')
            ->postJson("/api/v1/cards/{$c1}/move", [
                'column_id' => $this->second->id,
                'position' => 1,
            ])->assertOk();

        $this->assertSame(
            [$b1, $c1],
            $this->second->cards()->orderBy('position')->pluck('id')->toArray(),
        );

        $this->assertSame(
            [100],
            $this->first->cards()->orderBy('position')->pluck('position')->toArray(),
        );
    }

    public function test_card_cannot_move_across_boards(): void
    {
        $c1 = $this->createCard($this->first, 'A');

        $this->actingAs($this->member, 'sanctum')
            ->postJson("/api/v1/cards/{$c1}/move", [
                'column_id' => $this->otherBoardColumn->id,
                'position' => 0,
            ])->assertUnprocessable();
    }

    public function test_positions_remain_stable_after_repeated_moves(): void
    {
        $ids = [
            $this->createCard($this->first, '1'),
            $this->createCard($this->first, '2'),
            $this->createCard($this->first, '3'),
            $this->createCard($this->first, '4'),
        ];

        $moves = [
            [$ids[3], 0], [$ids[0], 3], [$ids[1], 0], [$ids[3], 2],
        ];

        foreach ($moves as [$cardId, $index]) {
            $this->actingAs($this->member, 'sanctum')
                ->postJson("/api/v1/cards/{$cardId}/move", [
                    'column_id' => $this->first->id,
                    'position' => $index,
                ])->assertOk();
        }

        $positions = $this->first->cards()->orderBy('position')->pluck('position')->toArray();
        $this->assertSame([100, 200, 300, 400], $positions);
    }
}
