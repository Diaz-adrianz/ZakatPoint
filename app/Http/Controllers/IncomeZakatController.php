<?php

namespace App\Http\Controllers;

use App\Helpers\MetalPriceHelper;
use App\Mail\InstructionMail;
use App\Models\IncomeZakat;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class IncomeZakatController extends Controller
{
    /**
     * Hitung zakat saja (dipakai kalkulator di FE, tidak menyimpan).
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'income_month' => 'required|numeric|min:0',
            'income_plus'  => 'required|numeric|min:0',
        ]);

        // Selalu ambil harga emas hari ini via helper (akan simpan / fallback jika perlu)
        $goldPrice = MetalPriceHelper::getGoldToday();           // Rp/gram
        $nisabBulanan = (85 * $goldPrice) / 12;                // 85 gr dibagi 12

        $totalIncome = $validated['income_month'] + $validated['income_plus'];
        $isNisab     = $totalIncome >= $nisabBulanan;
        $amount      = $isNisab ? $totalIncome * 0.025 : 0;

        return response()->json([
            'gold_price'  => round($goldPrice, 0),
            'is_nisab'    => $isNisab,
            'amount'      => round($amount, 0),
            'message'     => $isNisab
                ? 'Anda wajib membayar zakat.'
                : 'Belum wajib membayar zakat karena belum mencapai nisab.',
        ]);
    }

    /**
     * Simpan zakat (dipanggil setelah user menekan "Bayar").
     * Hanya menyimpan bila memang wajib.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'income_month' => 'required|numeric|min:0',
            'income_plus'  => 'required|numeric|min:0',
            'email'        => 'required|email',
            'name'         => 'required|string|max:255',
            'no_hp'        => 'required|string|max:30',
            'gender'       => 'required|in:bapak,ibu',
            'village_id'   => 'required|exists:villages,id',
            'payment_id'   => 'required|exists:payments,id',
        ]);

        // --- hitung lagi untuk keamanan ---
        $goldPrice    = MetalPriceHelper::getGoldToday();
        $nisabBulanan = (85 * $goldPrice) / 12;

        $totalIncome  = $validated['income_month'] + $validated['income_plus'];
        $isNisab      = $totalIncome >= $nisabBulanan;
        $amount       = $isNisab ? $totalIncome * 0.025 : 0;

        if (!$isNisab) {
            return response()->json([
                'success' => false,
                'message' => 'Penghasilan belum mencapai nisab, tidak wajib zakat.',
            ], 422);
        }

        // --- simpan ---
        $zakat = IncomeZakat::create([
            'income_month' => $validated['income_month'],
            'income_plus'  => $validated['income_plus'],
            'amount'       => round($amount, 0),
            'email'        => $validated['email'],
            'name'         => $validated['name'],
            'no_hp'        => $validated['no_hp'],
            'gender'       => $validated['gender'],
            'village_id'   => $validated['village_id'],
            'payment_id'   => $request->payment_id,
        ]);

        $payment = Payment::findOrFail($request['payment_id']);

        if ($request->filled('email')) {
            Mail::to($request['email'])->send(new InstructionMail($payment));
        }

        return response()->json([
            'success'      => true,
            'zakat_id'     => $zakat->id,
            'amount'       => round($amount, 0),
            'nisab_value'  => round($nisabBulanan, 0),
            'gold_price'   => round($goldPrice, 0),
        ]);
    }
}
