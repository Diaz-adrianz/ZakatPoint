<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount'      => 'required|numeric|min:0',
            'method'      => 'required|in:ewallet,manual_transfer,virtual_account,over_the_counter',
            'channel'     => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
        ]);

        $payment = Payment::create([
            'amount'            => round($validated['amount'], 0),
            'currency'          => 'IDR',
            'country_code'      => 'ID',
            'status'            => 'PENDING',
            'method'            => $validated['method'],
            'channel'           => $validated['channel'] ?? null,
            'description'       => $validated['description'] ?? 'Pembayaran zakat',
            'reference_id'      => 'ZKT-' . strtoupper(Str::random(10)),
            'expired_at'        => now()->addHours(24),
            'status_update_at'  => now(),
        ]);

        return response()->json([
            'success'      => true,
            'payment_id'   => $payment->id,
            'reference_id' => $payment->reference_id,
            'status'       => $payment->status,
        ]);
    }
}
