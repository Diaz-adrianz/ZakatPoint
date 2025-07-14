<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\PaymentItem;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'amount',
        'status',
        'payment_type',
        'snap_token',
        'first_name',
        'last_name',
        'email',
        'phone',
        'expired_at',
        'status_update_at',
    ];

    public function items()
    {
        return $this->hasMany(PaymentItem::class);
    }
    public function goldZakat() {
    return $this->hasOne(GoldZakat::class);
    }

    public function incomeZakat() {
        return $this->hasOne(IncomeZakat::class);
    }

    public function silverZakat() {
        return $this->hasOne(SilverZakat::class);
    }

    public function fitrahZakat() {
        return $this->hasOne(FitrahZakat::class);
    }
}
