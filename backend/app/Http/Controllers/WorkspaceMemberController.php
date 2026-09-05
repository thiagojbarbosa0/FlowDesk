<?php

namespace App\Http\Controllers;

use App\Actions\Workspace\AddMemberAction;
use App\Actions\Workspace\RemoveMemberAction;
use App\Actions\Workspace\UpdateMemberRoleAction;
use App\Http\Requests\AddMemberRequest;
use App\Http\Requests\UpdateMemberRoleRequest;
use App\Http\Resources\WorkspaceMemberResource;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceMemberController extends Controller
{
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $members = $workspace->memberships()->with('user:id,name,email')->get();

        return WorkspaceMemberResource::collection($members)->response();
    }

    public function store(AddMemberRequest $request, Workspace $workspace): WorkspaceMemberResource
    {
        $this->authorize('manageMembers', $workspace);

        $member = app(AddMemberAction::class)->execute(
            $request->user(),
            $workspace,
            $request->validated('email'),
            $request->enum('role', \App\Enums\WorkspaceRole::class),
        );

        return WorkspaceMemberResource::make($member)->response()->setStatusCode(201);
    }

    public function update(UpdateMemberRoleRequest $request, Workspace $workspace, User $user): WorkspaceMemberResource
    {
        $this->authorize('manageMembers', $workspace);

        $member = app(UpdateMemberRoleAction::class)->execute(
            $request->user(),
            $workspace,
            $user,
            $request->enum('role', \App\Enums\WorkspaceRole::class),
        );

        return WorkspaceMemberResource::make($member);
    }

    public function destroy(Request $request, Workspace $workspace, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);

        app(RemoveMemberAction::class)->execute($request->user(), $workspace, $user);

        return response()->noContent();
    }
}
