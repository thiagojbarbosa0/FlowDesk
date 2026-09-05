<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\CardAssigneeController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CardLabelController;
use App\Http\Controllers\ColumnController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceMemberController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

        Route::get('/workspaces', [WorkspaceController::class, 'index']);
        Route::post('/workspaces', [WorkspaceController::class, 'store']);
        Route::get('/workspaces/{workspace}', [WorkspaceController::class, 'show']);
        Route::put('/workspaces/{workspace}', [WorkspaceController::class, 'update']);
        Route::delete('/workspaces/{workspace}', [WorkspaceController::class, 'destroy']);

        Route::get('/workspaces/{workspace}/members', [WorkspaceMemberController::class, 'index']);
        Route::post('/workspaces/{workspace}/members', [WorkspaceMemberController::class, 'store']);
        Route::put('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'update']);
        Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'destroy']);

        Route::get('/workspaces/{workspace}/activities', [ActivityController::class, 'index']);
        Route::get('/workspaces/{workspace}/dashboard', [DashboardController::class, 'show']);

        Route::get('/workspaces/{workspace}/labels', [LabelController::class, 'index']);
        Route::post('/workspaces/{workspace}/labels', [LabelController::class, 'store']);
        Route::put('/labels/{label}', [LabelController::class, 'update']);
        Route::delete('/labels/{label}', [LabelController::class, 'destroy']);

        Route::get('/workspaces/{workspace}/projects', [ProjectController::class, 'index']);
        Route::post('/workspaces/{workspace}/projects', [ProjectController::class, 'store']);
        Route::get('/projects/{project}', [ProjectController::class, 'show']);
        Route::put('/projects/{project}', [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

        Route::get('/projects/{project}/boards', [BoardController::class, 'index']);
        Route::post('/projects/{project}/boards', [BoardController::class, 'store']);
        Route::get('/boards/{board}', [BoardController::class, 'show']);
        Route::put('/boards/{board}', [BoardController::class, 'update']);
        Route::delete('/boards/{board}', [BoardController::class, 'destroy']);

        Route::post('/boards/{board}/columns', [ColumnController::class, 'store']);
        Route::put('/columns/{column}', [ColumnController::class, 'update']);
        Route::delete('/columns/{column}', [ColumnController::class, 'destroy']);

        Route::post('/columns/{column}/cards', [CardController::class, 'store']);
        Route::get('/cards/{card}', [CardController::class, 'show']);
        Route::put('/cards/{card}', [CardController::class, 'update']);
        Route::delete('/cards/{card}', [CardController::class, 'destroy']);
        Route::post('/cards/{card}/move', [CardController::class, 'move']);

        Route::post('/cards/{card}/assignees', [CardAssigneeController::class, 'store']);
        Route::delete('/cards/{card}/assignees/{user}', [CardAssigneeController::class, 'destroy']);
        Route::post('/cards/{card}/labels', [CardLabelController::class, 'store']);
        Route::delete('/cards/{card}/labels/{label}', [CardLabelController::class, 'destroy']);

        Route::get('/cards/{card}/comments', [CommentController::class, 'index']);
        Route::post('/cards/{card}/comments', [CommentController::class, 'store']);
    });
});
