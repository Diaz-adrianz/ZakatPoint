<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['amount', 'currency', 'country_code', 'status', 'method', 'channel', 'description', 'reference_id', 'failed_reason', 'expired_at', 'status_update_at', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
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
