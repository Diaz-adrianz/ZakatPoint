<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SilverPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'price',
        'date',
    ];

    protected $casts = [
        'price' => 'float',
        'date'  => 'date',
    ];
}
