<?php

namespace Database\Seeders;

use App\Actions\Board\CreateBoardAction;
use App\Actions\Card\AssignCardAction;
use App\Actions\Card\CreateCardAction;
use App\Actions\Comment\CreateCommentAction;
use App\Actions\Project\CreateProjectAction;
use App\Actions\Workspace\AddMemberAction;
use App\Actions\Workspace\CreateWorkspaceAction;
use App\Enums\CardPriority;
use App\Enums\WorkspaceRole;
use App\Models\Label;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Notificações nascem sincronamente durante o seed (sem worker rodando).
        config(['queue.default' => 'sync']);

        $owner = $this->user('Owner Demo', 'owner@flowdesk.test');
        $admin = $this->user('Admin Demo', 'admin@flowdesk.test');
        $member = $this->user('Member Demo', 'member@flowdesk.test');
        $viewer = $this->user('Viewer Demo', 'viewer@flowdesk.test');

        $workspace = app(CreateWorkspaceAction::class)->execute($owner, 'FlowDesk Demo');

        app(AddMemberAction::class)->execute($owner, $workspace, $admin->email, WorkspaceRole::Admin);
        app(AddMemberAction::class)->execute($owner, $workspace, $member->email, WorkspaceRole::Member);
        app(AddMemberAction::class)->execute($owner, $workspace, $viewer->email, WorkspaceRole::Viewer);

        $website = app(CreateProjectAction::class)->execute($owner, $workspace, 'Website', 'Landing page e blog');
        $mobile = app(CreateProjectAction::class)->execute($owner, $workspace, 'Mobile App', 'App iOS/Android');

        $board = app(CreateBoardAction::class)->execute($owner, $website, 'Board Website');

        $bug = Label::create(['workspace_id' => $workspace->id, 'name' => 'bug', 'color' => '#fecdd3']);
        $feature = Label::create(['workspace_id' => $workspace->id, 'name' => 'feature', 'color' => '#bfdbfe']);
        $urgent = Label::create(['workspace_id' => $workspace->id, 'name' => 'urgent', 'color' => '#fde68a']);

        $columns = $board->columns()->orderBy('position')->get();

        $card = fn (int $i, string $title, string $description, CardPriority $p, ?string $due) => app(CreateCardAction::class)->execute(
            $member,
            $columns[$i],
            ['title' => $title, 'description' => $description, 'priority' => $p->value, 'due_date' => $due],
        );

        $c1 = $card(0, 'Design da homepage', 'Wireframe e alta fidelidade', CardPriority::High, now()->addDays(5)->toDateString());
        $c2 = $card(0, 'Bug: login retorna 500', 'Erro ao autenticar com e-mail maiúsculo', CardPriority::Urgent, now()->subDays(2)->toDateString());
        $c3 = $card(1, 'Setup do CI', 'GitHub Actions com Postgres', CardPriority::Medium, now()->addDays(10)->toDateString());
        $c4 = $card(2, 'Revisar copy da landing', 'Título e CTA', CardPriority::Low, now()->addDays(3)->toDateString());
        $c5 = $card(3, 'Deploy do staging', 'Ambiente de homologação', CardPriority::Medium, now()->subDay()->toDateString());

        app(AssignCardAction::class)->execute($owner, $c1, $member);
        app(AssignCardAction::class)->execute($owner, $c2, $admin);
        app(AssignCardAction::class)->execute($owner, $c3, $member);
        app(AssignCardAction::class)->execute($owner, $c5, $member);

        $c2->labels()->sync([$bug->id, $urgent->id]);
        $c1->labels()->sync([$feature->id]);
        $c4->labels()->sync([$feature->id]);

        app(CreateCommentAction::class)->execute($owner, $c2, 'Consegui reproduzir localmente. Parece o Hash::check.');
        app(CreateCommentAction::class)->execute($admin, $c1, 'Layout aprovado, pode seguir.');

        $mobileBoard = app(CreateBoardAction::class)->execute($owner, $mobile, 'Board Mobile');
        $mColumns = $mobileBoard->columns()->orderBy('position')->get();
        app(CreateCardAction::class)->execute($admin, $mColumns[0], [
            'title' => 'Definir stack (React Native vs Flutter)',
            'priority' => CardPriority::High->value,
        ]);
    }

    private function user(string $name, string $email): User
    {
        return User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password'),
        ]);
    }
}
