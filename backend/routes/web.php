<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['app' => 'FlowDesk API', 'version' => 'v1']));
