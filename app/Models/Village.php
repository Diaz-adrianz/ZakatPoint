<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Village extends Model
{
    protected $fillable = ['province', 'city', 'district', 'village', 'postalCode', 'longitude', 'latitude', 'emailVillage'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_villages')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function incomeZakats()
    {
        return $this->hasMany(IncomeZakat::class);
    }

    public function malZakats()
    {
        return $this->hasMany(MalZakat::class);
    }

    public function fitrahZakatPeriodeSessions()
    {
        return $this->hasMany(FitrahZakatPeriodeSession::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }
}

