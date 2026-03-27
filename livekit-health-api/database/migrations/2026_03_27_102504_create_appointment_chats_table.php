<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('appointment_chats', function (Blueprint $table) {
        $table->id();
        $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
        
        $table->unsignedBigInteger('sender_id');           // ← Sin constrained
        $table->string('sender_type');                     // 'App\Models\Patient' o 'App\Models\Doctor'
        $table->string('sender_role');                     // 'patient' o 'doctor' (para facilitar frontend)
        
        $table->text('message');
        $table->timestamps();

        $table->index(['appointment_id', 'created_at']);
    });
}

    public function down(): void
    {
        Schema::dropIfExists('appointment_chats');
    }
};