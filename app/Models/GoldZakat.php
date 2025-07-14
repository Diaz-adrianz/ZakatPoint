<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoldZakat extends Model
{
    protected $fillable = [
        'weight', 'amount',
        'email', 'name', 'no_hp', 'gender',
        'village_id', 'payment_id',
    ];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
