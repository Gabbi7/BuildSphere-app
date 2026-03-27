<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_code')->unique();
            $table->string('project_name');
            $table->string('client_name');
            $table->text('address');
            $table->text('description')->nullable();
            $table->decimal('contract_price', 15, 2)->default(0);
            $table->decimal('contract_unit_price', 15, 2)->nullable();
            $table->decimal('budget_for_materials', 15, 2)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('PROPOSED');

            // Relationships
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('project_in_charge_id')->nullable()->constrained('users')->nullOnDelete();

            // Approval tracking
            $table->foreignId('accounting_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accounting_approved_at')->nullable();
            $table->foreignId('executive_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('executive_approved_at')->nullable();

            // Rejection tracking
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('created_by');
            $table->index('project_in_charge_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
