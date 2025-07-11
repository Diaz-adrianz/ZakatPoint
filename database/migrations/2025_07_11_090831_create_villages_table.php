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
        Schema::create('villages', function (Blueprint $table) {
            $table->id();                              // pk
            $table->string('province');
            $table->string('city');
            $table->string('district');
            $table->string('village');
            $table->string('postal_code');
            $table->string('longitude');
            $table->string('latitude');
            $table->string('email_village')->unique();
            $table->timestamps();
            $table->unique(['village', 'postal_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('villages');
    }
};
