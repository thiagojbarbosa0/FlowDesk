<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')->constrained('boards')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('position');
            $table->timestamps();
            $table->index('board_id');
        });

        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('column_id')->constrained('columns')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('priority')->default('medium');
            $table->timestamp('due_date')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['column_id', 'position']);
            $table->index('created_by');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards');
        Schema::dropIfExists('columns');
    }
};
