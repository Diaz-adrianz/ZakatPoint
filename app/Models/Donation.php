<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = ['title', 'description', 'slug', 'village_id', 'target'];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function donaturs()
    {
        return $this->hasMany(Donatur::class);
    }
}
