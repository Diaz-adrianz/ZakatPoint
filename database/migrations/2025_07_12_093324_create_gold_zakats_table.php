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
        Schema::create('gold_zakats', function (Blueprint $table) {
            $table->id();
            $table->decimal('price', 18, 2); // harga emas / gram saat transaksi
            $table->decimal('amount', 18, 2);
            $table->string('email');
            $table->string('name');
            $table->string('no_hp');
            $table->enum('gender', ['bapak', 'ibu']);
            $table->foreignId('village_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gold_zakats');
    }
};
