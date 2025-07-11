<?php

use App\Http\Controllers\RegionController;
use App\Http\Controllers\VillageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('daftar-desa', [VillageController::class, 'index'])->name('villages.index');
    Route::get('/daftar-desa/create', [VillageController::class, 'create'])->name('villages.create');
    Route::post('/daftar-desa', [VillageController::class, 'store'])->name('villages.store');
    Route::get('/api/initial-regions', [RegionController::class, 'getInitialRegions']);
    Route::post('/api/villages/filter', [VillageController::class, 'filter']); 
});

Route::get('/api/provinces', [RegionController::class, 'getProvinces']);
Route::get('/api/regencies/{provinceId}', [RegionController::class, 'getRegencies']);
Route::get('/api/districts/{regencyId}', [RegionController::class, 'getDistricts']);
Route::get('/api/villages/{districtId}', [RegionController::class, 'getVillages']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
