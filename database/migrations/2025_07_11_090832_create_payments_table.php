<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount', 18, 2);
            $table->enum('currency', ['IDR','USD'])->default('IDR');
            $table->enum('country_code', ['ID','US'])->default('ID');
            $table->enum('status', ['PENDING','PAID','FAILED','EXPIRED'])->default('PENDING');
            $table->enum('method', ['ewallet', 'manual_transfer', 'virtual_account', 'over_the_counter']);
            $table->string('channel')->nullable();
            $table->string('description')->nullable();
            $table->string('reference_id')->nullable();
            $table->string('failed_reason')->nullable();
            $table->dateTime('expired_at')->nullable();
            $table->dateTime('status_update_at')->default(DB::raw('CURRENT_TIMESTAMP'));;
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
