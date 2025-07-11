<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserVillage extends Model
{
    protected $fillable = ['user_id', 'village_id', 'role'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}
