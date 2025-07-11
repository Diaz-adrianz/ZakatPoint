<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MalZakat extends Model
{
    protected $fillable = ['asset', 'gold', 'otherAssets', 'receivables', 'amount', 'village_id', 'payment_id'];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
