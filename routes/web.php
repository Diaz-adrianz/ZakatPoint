<?php

use App\Helpers\MetalPriceHelper;
use App\Http\Controllers\FitrahZakatController;
use App\Http\Controllers\GoldZakatController;
use App\Http\Controllers\IncomeZakatController;
use App\Http\Controllers\InstructionController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\SilverZakatController;
use App\Http\Controllers\VillageController;
use App\Http\Controllers\FitrahZakatPeriodeSesssionController;
use App\Models\FitrahZakatPeriodeSession;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PaymentController;
use App\Models\IncomeZakat;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('artikel', [ArticleController::class, 'explore'])
     ->name('article.explore');

Route::get('artikel/{slug}', [ArticleController::class, 'view'])
     ->name('article.view');

// DONATION / SEDEKAH 
Route::get('sedekah', [DonationController::class, 'explore'])
     ->name('donation.explore');

Route::get('sedekah/{slug}', [DonationController::class, 'view'])
     ->name('donation.view');

Route::post('sedekah/{slug}/kirim', [DonationController::class, 'donate'])
     ->name('donation.donate');

// PAYMENT
Route::get('pembayaran/{id}', [PaymentController::class, 'view'])
     ->name('payment.view');

Route::get('bayar-zakat', function () {
    return Inertia::render('pay-zakat');
})->name('pay-zakat');

Route::post('income-zakat', [IncomeZakatController::class, 'store']);
Route::post('income-zakat/calculate', [IncomeZakatController::class, 'calculate']);
Route::post('gold-zakat/calculate', [GoldZakatController::class, 'calculate']);
Route::post('silver-zakat/calculate', [SilverZakatController::class, 'calculate']);
Route::post('gold-zakat', [GoldZakatController::class, 'store']);
Route::get('/income-zakat/nisab', function () {
    $goldPrice = MetalPriceHelper::getGoldToday();
    $nisabBulanan = (85 * $goldPrice) / 12;   // 85 gr ÷ 12 bulan

    return response()->json([
        'gold_price' => round($goldPrice),
        'nisab_value'=> round($nisabBulanan),
    ]);
});
Route::get('/gold-price', function () {
    $pricePerGram = MetalPriceHelper::getGoldToday();
    $nisab        = 85 * $pricePerGram;

    return response()->json([
        'price_per_gram' => $pricePerGram,
        'nisab_value'=> round($nisab),
    ]);
});
Route::get('/silver-price', function () {
    $pricePerGram = MetalPriceHelper::getSilverToday();
    $nisab        = 595 * $pricePerGram;

    return response()->json([
        'price_per_gram' => $pricePerGram,
        'nisab_value'=> round($nisab),
    ]);
});
Route::post('silver-zakat', [SilverZakatController::class, 'store']);
Route::get('api/villages/search', [VillageController::class, 'search'])->name('villages.search');

Route::get('bayar-zakat-fitrah/{code}', function ($code, Request $request) {
    $session = FitrahZakatPeriodeSession::where('code', $code)->firstOrFail();

    return Inertia::render('pay-zakat-fitrah', [
        'session' => [
            'id'         => $session->id,
            'title'      => $session->title,
            'rice_price'  => $session->rice_price,
        ],
        'village'  => [
            'id'   => $request->query('village_id'),
            'name' => $request->query('village_name'),
        ],
    ]);
})->name('pay-zakat-fitrah');
Route::get('fitrah-session/by-village/{id}', function ($id) {
    $today = Carbon::today();
    $session = FitrahZakatPeriodeSession::where('village_id', $id)
        ->where('start_date', '<=', $today)
        ->where('end_date', '>=', $today)
        ->first();

    return response()->json([
        'code' => $session?->code,
        'available' => $session !== null,
    ]);
});
Route::post('fitrah-zakat', [FitrahZakatController::class, 'store']);
Route::post('/payments', [PaymentController::class, 'store']);
Route::get('/instruksi/{reference}', function ($reference) {
    $payment = Payment::where('reference_id', $reference)->firstOrFail();
    return app(InstructionController::class)->show($payment);
});

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

    // ZAKAT INCOME / PENGHASILAN
    Route::get('zakat-penghasilan', [IncomeZakatController::class, 'list'])
         ->name('zakat-income-list');

    // ZAKAT GOLD / EMAS
    Route::get('zakat-emas', [GoldZakatController::class, 'list'])
        ->name('zakat-gold-list');

    // ZAKAT SILVER / PERAK
    Route::get('zakat-perak', [SilverZakatController::class, 'list'])
        ->name('zakat-silver-list');

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

    // ZAKAT FITRAH PERIODE
    Route::get('zakat-fitrah', [FitrahZakatPeriodeSesssionController::class, 'list'])
        ->name('zakat-fitrah-periode.list');
    Route::get('zakat-fitrah/view/{code}', [FitrahZakatPeriodeSesssionController::class, 'view'])
            ->middleware('check_village_role:admin|editor|member')
            ->name('zakat-fitrah-periode.view');
    Route::delete('zakat-fitrah/{id}', [FitrahZakatPeriodeSesssionController::class, 'destroy'])
        ->middleware('check_village_role:admin|editor')
        ->name('zakat-fitrah-periode.destroy');
    Route::get('zakat-fitrah/tambah', [FitrahZakatPeriodeSesssionController::class, 'add'])
        ->middleware('check_village_role:admin|editor')
        ->name('zakat-fitrah-periode.add');
    Route::post('zakat-fitrah/tambah', [FitrahZakatPeriodeSesssionController::class, 'store'])
        ->middleware('check_village_role:admin|editor')
        ->name('zakat-fitrah-periode.store');
    Route::get('zakat-fitrah/edit/{id}', [FitrahZakatPeriodeSesssionController::class, 'edit'])
         ->middleware('check_village_role:admin|editor')
         ->name('zakat-fitrah-periode.edit');
    Route::post('zakat-fitrah/edit/{id}', [FitrahZakatPeriodeSesssionController::class, 'update'])
         ->middleware('check_village_role:admin|editor')
         ->name('zakat-fitrah-periode.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/api.php';
