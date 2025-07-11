<?php

use App\Http\Controllers\RegionController;
use App\Http\Controllers\VillageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('jelajahi-materi-belajar', function () {
    return Inertia::render('explore-learning-materials');
})->name('explore-learning-materials');

Route::get('jelajahi-donasi', function () {
    return Inertia::render('explore-donations');
})->name('explore-donations');

Route::get('bayar-zakat', function () {
    return Inertia::render('pay-zakat');
})->name('pay-zakat');

Route::get('bayar-zakat-fitrah/{code}', function () {
    return Inertia::render('pay-zakat-fitrah');
})->name('pay-zakat-fitrah');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dasbor', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('daftar-desa', [VillageController::class, 'index'])->name('villages.index');
    Route::get('/daftar-desa/create', [VillageController::class, 'create'])->name('villages.create');
    Route::post('/daftar-desa', [VillageController::class, 'store'])->name('villages.store');
    Route::get('/api/initial-regions', [RegionController::class, 'getInitialRegions']);
    Route::post('/api/villages/filter', [VillageController::class, 'filter']); 

    Route::get('zakat-mal', function () {
        return Inertia::render('zakat-mal');
    })->name('zakat-mal');
    Route::get('zakat-penghasilan', function () {
        return Inertia::render('zakat-income');
    })->name('zakat-income');
    Route::get('zakat-fitrah', function () {
        return Inertia::render('zakat-fitrah');
    })->name('zakat-fitrah');
    Route::get('donasi', function () {
        return Inertia::render('donations');
    })->name('donations');
    Route::get('materi-belajar', function () {
        return Inertia::render('learning-materials');
    })->name('learning-materials');
    Route::get('penduduk', function () {
        return Inertia::render('resident');
    })->name('resident');
    Route::get('profil-desa', function () {
        return Inertia::render('village-profile');
    })->name('village-profile');
    Route::get('cari-desa', function () {
        return Inertia::render('explore-villages');
    })->name('explore-villages');
    Route::get('tambah-desa', function () {
        return Inertia::render('new-village');
    })->name('new-village');
    Route::get('zakat-fitrah/tambah-periode', function () {
        return Inertia::render('add-zakat-fitrah-periode');
    })->name('add-zakat-fitrah-periode');
    Route::get('zakat-fitrah/edit-periode', function () {
        return Inertia::render('edit-zakat-fitrah-periode');
    })->name('edit-zakat-fitrah-periode');
    Route::get('donasi/tambah', function () {
        return Inertia::render('add-donation');
    })->name('add-donation');
    Route::get('donasi/edit', function () {
        return Inertia::render('edit-donation');
    })->name('edit-donation');
    Route::get('materi-belajar/tambah', function () {
        return Inertia::render('add-learning-material');
    })->name('add-learning-material');
    Route::get('materi-belajar/edit', function () {
        return Inertia::render('edit-learning-material');
    })->name('edit-learning-material');

});

Route::get('/api/provinces', [RegionController::class, 'getProvinces']);
Route::get('/api/regencies/{provinceId}', [RegionController::class, 'getRegencies']);
Route::get('/api/districts/{regencyId}', [RegionController::class, 'getDistricts']);
Route::get('/api/villages/{districtId}', [RegionController::class, 'getVillages']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
