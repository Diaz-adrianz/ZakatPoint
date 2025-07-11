<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitrahZakatPeriodeSession extends Model
{
    protected $fillable = ['startDate', 'endDate', 'title', 'ricePrice', 'village_id', 'code'];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function zakats()
    {
        return $this->hasMany(FitrahZakat::class, 'fitrah_session_id');
    }
}
