<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::create('payment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade'); 
            $table->string('name');
            $table->integer('price'); 
            $table->integer('quantity')->default(1);
            $table->string('item_id')->nullable();
            $table->string('brand')->nullable(); 
            $table->string('category')->nullable();
            $table->string('merchant_name')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();
        });
    }

    /**
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('payment_items');
    }
};
