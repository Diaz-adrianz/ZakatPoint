<?php
use App\Http\Controllers\RegionController;
use App\Http\Controllers\VillageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('api')->group(function () {

    // REGIONS 
    Route::get('/provinces', [RegionController::class, 'getProvinces']);
    Route::get('/regencies/{provinceId}', [RegionController::class, 'getRegencies']);
    Route::get('/districts/{regencyId}', [RegionController::class, 'getDistricts']);
    Route::get('/villages/{districtId}', [RegionController::class, 'getVillages']);        

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/user-villages', [VillageController::class, 'userVillages']);        
    });
});