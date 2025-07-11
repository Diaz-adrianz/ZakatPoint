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
        Schema::create('mal_zakats', function (Blueprint $table) {
            $table->id();
            $table->decimal('asset', 18, 2)->default(0);
            $table->decimal('gold', 18, 2)->default(0);
            $table->decimal('other_assets', 18, 2)->default(0);
            $table->decimal('receivables', 18, 2)->default(0);
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
        Schema::dropIfExists('mal_zakats');
    }
};
