<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncomeZakat extends Model
{
    protected $fillable = ['income_month', 'income_plus', 'amount', 'village_id', 'payment_id'];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
