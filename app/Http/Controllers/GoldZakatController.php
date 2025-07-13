<?php

namespace App\Http\Controllers;

use App\Helpers\MetalPriceHelper;
use App\Models\GoldZakat;
use Illuminate\Http\Request;

class GoldZakatController extends Controller
{
    public function calculate(Request $request)
{
    $request->validate([
        'price' => 'required|numeric|min:0',   // harga total emas dlm Rupiah
    ]);

    $goldPrice = MetalPriceHelper::getGoldToday(); // hasilnya float
    if ($goldPrice <= 0) {
        return response()->json(['error' => 'Harga emas tidak valid'], 500);
    }

    $nisab       = 85 * $goldPrice;      // 85 gram × harga per gram
    $inputPrice  = $request->price;
    $isNisab     = $inputPrice >= $nisab;
    $amount      = $isNisab ? $inputPrice * 0.025 : 0;

    return response()->json([
        'amount'      => round($amount),
        'is_nisab'    => $isNisab,
        'nisab_value' => round($nisab),
        'message'     => $isNisab
                         ? 'Anda wajib membayar zakat.'
                         : 'Belum wajib membayar zakat karena belum mencapai nisab.',
    ]);
}


     public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'email' => 'nullable|email',
        'no_hp' => 'nullable|string',
        'gender' => 'required|in:bapak,ibu',
        'price' => 'required|numeric|min:0',
        'amount' => 'required|numeric|min:0',
        'village_id' => 'required|exists:villages,id',
        'payment_id' => 'required|exists:payments,id',
    ]);

    $zakat = GoldZakat::create([
        'name' => $request->name,
        'email' => $request->email,
        'no_hp' => $request->no_hp,
        'gender' => $request->gender,
        'price' => $request->price,
        'amount' => $request->amount,
        'village_id' => $request->village_id,
        'payment_id' => $request->payment_id,
    ]);

    return response()->json(['success' => true, 'zakat_id' => $zakat->id]);
}

}
