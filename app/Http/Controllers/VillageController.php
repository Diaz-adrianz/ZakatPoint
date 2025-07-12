<?php

namespace App\Http\Controllers;

use App\Models\Village;
use App\Models\UserVillage;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Http\Controllers\RegionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

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
        $regionController = new RegionController();
        $provinces = $regionController->getProvinces();

        return Inertia::render('new-village', [
            'provinces' => $provinces
        ]);
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
                })->where('postal_code', $request->postal_code),
            ],
            'longitude' => 'nullable|string',
            'latitude' => 'nullable|string',
            'email_village' => 'nullable|email|unique:villages,email_village',
        ]);

        $village = Village::create($request->all());

        UserVillage::create([
            'user_id' => Auth::id(),
            'village_id' => $village->id,
            'role' => 'admin', 
        ]);

        return redirect()->route('dashboard')->with('success', 'Desa berhasil ditambahkan.');
    }

}
