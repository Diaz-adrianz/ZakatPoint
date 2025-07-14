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
}
