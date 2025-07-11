<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = ['title', 'slug', 'content', 'village_id'];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}
