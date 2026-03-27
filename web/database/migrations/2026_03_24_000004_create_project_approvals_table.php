<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('approval_stage'); // ACCOUNTING, EXECUTIVE
            $table->foreignId('approver_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('decision'); // APPROVED, REJECTED
            $table->text('comments')->nullable();
            $table->timestamp('decided_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_approvals');
    }
};
