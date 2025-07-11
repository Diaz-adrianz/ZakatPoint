<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GoldPrice extends Model
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
