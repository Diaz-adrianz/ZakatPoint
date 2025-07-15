<?php
use App\Http\Controllers\RegionController;
use App\Http\Controllers\VillageController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\PaymentController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('api')->group(function () {

    // REGIONS 
    Route::get('/provinces', [RegionController::class, 'getProvinces']);
    Route::get('/regencies/{provinceId}', [RegionController::class, 'getRegencies']);
    Route::get('/districts/{regencyId}', [RegionController::class, 'getDistricts']);
    Route::get('/villages/{districtId}', [RegionController::class, 'getVillages']);        

    // ARTICLE
    Route::get('/article-listraw', [ArticleController::class, 'listRaw'])
         ->name("article.listraw");
    Route::post('/chatbot-article', [ArticleController::class, 'chat'])
         ->name("article.chat");

    Route::post('/midtrans-webhook', [PaymentController::class, 'handleMidtransWebhook'])
         ->name('midtrans-webhook');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/user-villages', [VillageController::class, 'userVillages']);        
    });
});