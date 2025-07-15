<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitrahZakatPeriodeSession extends Model
{
    protected $fillable = ['start_date', 'end_date', 'title', 'rice_price', 'village_id', 'code'];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function zakats()
    {
        return $this->hasMany(FitrahZakat::class, 'fitrah_session_id');
    }
}
