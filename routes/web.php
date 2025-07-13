<?php

use App\Http\Controllers\RegionController;
use App\Http\Controllers\VillageController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\DonationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('artikel', [ArticleController::class, 'explore'])
     ->name('article.explore');

Route::get('artikel/{slug}', [ArticleController::class, 'view'])
     ->name('article.view');

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
    
    // VILLAGE / DESA 
    Route::get('penduduk', [VillageController::class, 'getVillageUsers'])->name('resident');
    Route::patch('terima-penduduk', [VillageController::class, 'acceptUserVillage'])
         ->middleware('check_village_role:admin')
         ->name('accept-uservillage');
    Route::patch('ubah-peran-penduduk', [VillageController::class, 'changeUserVillageRole'])
         ->middleware('check_village_role:admin')
         ->name('change-uservillage-role');

    Route::get('profil-desa', function () {
        return Inertia::render('village-profile');
    })->name('village-profile');
    Route::get('cari-desa', [VillageController::class, 'exploreVillages'])->name('explore-villages');
    Route::post('gabung-desa', [VillageController::class, 'joinVillage'])->name('join-village');
    Route::get('tambah-desa', [VillageController::class, 'create'])->name('new-village');
    Route::post('tambah-desa', [VillageController::class, 'store'])->name('village.store');

    Route::get('zakat-fitrah/tambah-periode', function () {
        return Inertia::render('add-zakat-fitrah-periode');
    })->name('add-zakat-fitrah-periode');
    Route::get('zakat-fitrah/edit-periode', function () {
        return Inertia::render('edit-zakat-fitrah-periode');
    })->name('edit-zakat-fitrah-periode');

    // ARTICLE / ARTIKEL BELAJAR 
    Route::get('daftar-artikel', [ArticleController::class, 'list'])
         ->name('article.list');
    Route::delete('daftar-artikel/{id}', [ArticleController::class, 'destroy'])
         ->middleware('check_village_role:admin|editor')
         ->name('article.destroy');
    Route::get('daftar-artikel/tambah', [ArticleController::class, 'add'])
         ->middleware('check_village_role:admin|editor')
         ->name('article.add');
    Route::post('daftar-artikel/tambah', [ArticleController::class, 'store'])
         ->middleware('check_village_role:admin|editor')
         ->name('article.store');
    Route::get('daftar-artikel/edit/{id}', [ArticleController::class, 'edit'])
         ->middleware('check_village_role:admin|editor')
         ->name('article.edit');
    Route::post('daftar-artikel/edit/{id}', [ArticleController::class, 'update'])
         ->middleware('check_village_role:admin|editor')
         ->name('article.update');

    // DONATION / SEDEKAH
    Route::get('daftar-sedekah', [DonationController::class, 'list'])
        ->name('donation.list');
    Route::delete('daftar-sedekah/{id}', [DonationController::class, 'destroy'])
        ->middleware('check_village_role:admin|editor')
        ->name('donation.destroy');
    Route::get('daftar-sedekah/tambah', [DonationController::class, 'add'])
        ->middleware('check_village_role:admin|editor')
        ->name('donation.add');
    Route::post('daftar-sedekah/tambah', [DonationController::class, 'store'])
        ->middleware('check_village_role:admin|editor')
        ->name('donation.store');
    Route::get('daftar-sedekah/edit/{id}', [DonationController::class, 'edit'])
         ->middleware('check_village_role:admin|editor')
         ->name('donation.edit');
    Route::post('daftar-sedekah/edit/{id}', [DonationController::class, 'update'])
         ->middleware('check_village_role:admin|editor')
         ->name('donation.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/api.php';
