<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentItem extends Model
{
    use HasFactory;

    protected $table = 'payment_items';

    protected $fillable = [
        'payment_id',
        'item_id',
        'price',
        'quantity',
        'name',
        'brand',
        'category',
        'merchant_name',
        'url',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
