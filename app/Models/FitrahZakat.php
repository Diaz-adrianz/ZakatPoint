<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitrahZakat extends Model
{
    protected $fillable = [
        'dependents', 'amount',
        'email', 'name', 'no_hp', 'gender',
        'fitrah_session_id', 'payment_id',
    ];

    public function session()
    {
        return $this->belongsTo(FitrahZakatPeriodeSession::class, 'fitrah_session_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
