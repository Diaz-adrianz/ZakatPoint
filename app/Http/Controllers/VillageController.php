<?php

namespace App\Http\Controllers;

use App\Models\Village;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;


class VillageController extends Controller
{
    public function index()
{
    $villages = Village::orderBy('province')->get();

    $provinces = Http::get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
                    ->json();

    return Inertia::render('Villages/Index', [
        'villages' => $villages,
        'provinces' => $provinces,
    ]);
}

    public function create()
{
    return Inertia::render('Villages/Create');
}

public function store(Request $request)
{
    $request->validate([
        'province' => 'required|string|max:100',
        'city' => 'required|string|max:100',
        'district' => 'required|string|max:100',
        'village' => 'required|string|max:255',
    'postal_code' => [
        'required',
        Rule::unique('villages')->where(function ($query) use ($request) {
            return $query->where('village', $request->village);
        }),
    ],
        'longitude' => 'nullable|string',
        'latitude' => 'nullable|string',
        'email_village' => 'nullable|email|unique:villages,email_village',
    ]);

    Village::create($request->all());

    return redirect()->route('villages.index')->with('success', 'Desa berhasil ditambahkan.');
}
public function search(Request $request)
{
    $query = $request->q;

    $villages = DB::table('villages')
        ->where('village', 'like', "%{$query}%")
        ->select('id', 'village as name')
        ->limit(10)
        ->get();

    return response()->json($villages);
}


}
