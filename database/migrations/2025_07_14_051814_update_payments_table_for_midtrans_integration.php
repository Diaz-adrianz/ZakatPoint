<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; 

return new class extends Migration
{
    /**
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['currency', 'country_code', 'method', 'channel', 'description', 'reference_id', 'failed_reason']);

            $table->string('order_id')->after('id');
            $table->string('payment_type')->nullable()->after('status');
            $table->string('snap_token')->nullable()->after('payment_type');
            $table->string('first_name')->nullable()->after('snap_token');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('email')->nullable()->after('last_name');
            $table->string('phone')->nullable()->after('email');
            $table->enum('status', ['PENDING', 'SUCCESS', 'FAILURE'])->default('PENDING')->change();
        });
    }

    /**
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['order_id', 'payment_type', 'snap_token', 'first_name', 'last_name', 'email', 'phone']);
            $table->enum('currency', ['IDR', 'USD'])->default('IDR')->after('amount');
            $table->enum('country_code', ['ID', 'US'])->default('ID')->after('currency');
            $table->enum('method', ['ewallet', 'manual_transfer', 'virtual_account', 'over_the_counter'])->after('status');
            $table->string('channel')->nullable()->after('method');
            $table->string('description')->nullable()->after('channel');
            $table->string('reference_id')->nullable()->after('description');
            $table->string('failed_reason')->nullable()->after('reference_id');
            $table->enum('status', ['PENDING', 'PAID', 'FAILED', 'EXPIRED'])->default('PENDING')->change();
        });
    }
};
