<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_attachments', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->unsignedBigInteger('task_id');

            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('file_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();

            $table->unsignedBigInteger('uploaded_by');

            $table->timestamps();

            // Foreign keys
            $table->foreign('task_id')
                  ->references('id')->on('tasks')
                  ->onDelete('cascade');

            $table->foreign('uploaded_by')
                  ->references('id')->on('users')
                  ->onDelete('restrict');

            // Indexes
            $table->index('task_id');
            $table->index('uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_attachments');
    }
};
