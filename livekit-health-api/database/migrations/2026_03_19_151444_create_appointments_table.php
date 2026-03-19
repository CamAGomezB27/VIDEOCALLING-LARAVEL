<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('appointments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
        $table->foreignId('patient_id')->constrained()->cascadeOnDelete();

        $table->dateTime('scheduled_at');         // cuándo es la cita
        $table->unsignedSmallInteger('duration')  // duración en minutos
              ->default(30);

        $table->enum('status', [
            'scheduled',   // agendada
            'in_progress', // en curso
            'completed',   // finalizada
            'cancelled',   // cancelada
        ])->default('scheduled');

        // Campos LiveKit
        $table->string('livekit_room_name')->nullable()->unique();
        $table->dateTime('started_at')->nullable();
        $table->dateTime('ended_at')->nullable();

        $table->text('notes')->nullable(); // notas post-consulta

        $table->timestamps();
        $table->softDeletes();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};