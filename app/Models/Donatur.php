<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donatur extends Model
{
    protected $fillable = ['username', 'nominal', 'donation_id', 'payment_id'];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
