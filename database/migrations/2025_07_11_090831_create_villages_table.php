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
            $table->string('village')->unique();
            $table->string('postal_code')->unique();
            $table->string('longitude');
            $table->string('latitude');
            $table->string('email_village')->unique();
            $table->timestamps();
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
