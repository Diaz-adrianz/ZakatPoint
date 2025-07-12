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
        Schema::create('fitrah_zakats', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('dependents');
            $table->decimal('amount', 18, 2);
            $table->string('email');
            $table->string('name');
            $table->string('no_hp');
            $table->enum('gender', ['bapak', 'ibu']);
            $table->foreignId('fitrah_session_id')
                ->constrained('fitrah_zakat_periode_sessions')
                ->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fitrah_zakats');
    }
};
