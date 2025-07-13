<?php

namespace App\Http\Controllers;

use App\Helpers\MetalPriceHelper;
use App\Models\SilverZakat;
use Illuminate\Http\Request;

class SilverZakatController extends Controller
{
    public function calculate(Request $request)
{
    $request->validate([
        'price' => 'required|numeric|min:0',
    ]);

    $pricePerGram = MetalPriceHelper::getSilverToday();
    $nisab = 595 * $pricePerGram;
    $inputPrice = $request->price;
    $isNisab = $inputPrice >= $nisab;
    $amount = $isNisab ? $inputPrice * 0.025 : 0;

    return response()->json([
        'amount'       => round($amount),
        'is_nisab'     => $isNisab,
        'nisab_value'  => round($nisab),
        'message'      => $isNisab ? 'Anda wajib membayar zakat.' : 'Belum wajib membayar zakat karena belum mencapai nisab.',
    ]);
}

    public function store(Request $request)
    {
        $request->validate([
            'price' => 'required|numeric|min:0',
            'amount' => 'required|numeric|min:0',
            'village_id' => 'required|exists:villages,id',
            'payment_id' => 'required|exists:payments,id',
            'email' => 'nullable|email',
            'name' => 'required|string|max:255',
            'no_hp' => 'nullable|string|max:255',
            'gender' => 'required|in:bapak,ibu',
        ]);

        $zakat = SilverZakat::create($request->all());

        return response()->json([
            'success' => true,
            'zakat_id' => $zakat->id,
        ]);
    }

}
