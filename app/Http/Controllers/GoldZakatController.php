<?php

namespace App\Http\Controllers;

use App\Helpers\MetalPriceHelper;
use App\Mail\InstructionMail;
use App\Models\GoldZakat;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class GoldZakatController extends Controller
{
    public function calculate(Request $request)
{
    $request->validate([
        'weight' => 'required|numeric|min:0',
    ]);

    $pricePerGram = MetalPriceHelper::getGoldToday();
    $totalValue = $request->weight * $pricePerGram;
    $nisab       = 85 * $pricePerGram;
    $isNisab     = $totalValue >= $nisab;
    $amount      = $totalValue * 0.025;

    return response()->json([
        'amount'      => round($amount),
        'is_nisab'    => $isNisab,
        'message'     => $isNisab
                         ? 'Anda wajib membayar zakat.'
                         : 'Belum wajib membayar zakat karena belum mencapai nisab.',
    ]);
}


     public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'no_hp' => 'nullable|string|max:255',
            'gender' => 'required|in:bapak,ibu',
            'weight' => 'required|numeric|min:0',
            'amount' => 'required|numeric|min:0',
            'village_id' => 'required|exists:villages,id',
            'payment_id' => 'required|exists:payments,id',
        ]);

        $zakat = GoldZakat::create($request->all());

        $payment = Payment::findOrFail($request['payment_id']);

        if ($request->filled('email')) {
            Mail::to($request['email'])->send(new InstructionMail($payment));
        }

        return response()->json([
            'success' => true,
            'zakat_id' => $zakat->id,
        ]);
    }
}
