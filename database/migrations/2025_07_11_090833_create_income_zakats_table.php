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
        Schema::create('income_zakats', function (Blueprint $table) {
            $table->id();
            $table->decimal('income_month', 18, 2)->default(0);
            $table->decimal('income_plus', 18, 2)->default(0);
            $table->decimal('amount', 18, 2);
            $table->foreignId('village_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income_zakats');
    }
};
