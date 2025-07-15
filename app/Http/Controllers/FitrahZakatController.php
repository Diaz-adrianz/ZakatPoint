<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\InstructionMail;
use App\Models\FitrahZakat;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Midtrans\Snap;   // jika pakai Midtrans

class FitrahZakatController extends Controller
{
    /* ---------- STEP 1: simpan di session ---------- */
    public function prepare(Request $request)
    {
        $data = $request->validate([
            'dependents' => 'required|integer|min:1',
            'amount'     => 'required|numeric|min:0',
            'rice_price' => 'required|numeric|min:1000',
            'session_id' => 'required|exists:fitrah_zakat_periode_sessions,id',
        ]);

        $id = (string) Str::uuid();                          
        session()->put("zakat.fitrah.$id", $data);

        return response()->json(['success'=>true,'sid'=>$id]);
    }

    /* ---------- STEP 3: proses bayar ---------- */
public function pay(Request $request)
{
    $request->validate([
        'sid'     => 'required|string',
        'name'    => 'required|string|max:255',
        'email'   => 'required|email',
        'no_hp'   => 'required|string|regex:/^[0-9]{10,15}$/',
        'gender'  => 'required|in:Bapak,Ibu',
    ]);

    $draft = session("zakat.fitrah.{$request->sid}");
    abort_if(!$draft, 404);

    /* ===== 1. GUNAKAN PaymentController::store ===== */
    $paymentCtrl = new PaymentController();

    $payment = $paymentCtrl->store(
        [
            'amount'      => $draft['amount'],
            'first_name'  => $request->name,
            'email'       => $request->email,
            'phone'       => $request->no_hp,
        ],
        [
            [
                'item_id'  => 'zakat_fitrah',
                'name'     => 'Zakat Fitrah',
                'price'    => $draft['amount'],
                'quantity' => 1,
                'category' => 'zakat',
            ],
        ],
        2   // 2 jam kadaluarsa halaman pembayaran
    );

    if (!$payment) {
        return back()->withErrors(['error'=>'Gagal membuat transaksi.']);
    }

    /* ===== 2. SIMPAN ZAKAT ===== */
    FitrahZakat::create([
        'dependents'        => $draft['dependents'],
        'amount'            => $draft['amount'],
        'fitrah_session_id' => $draft['session_id'],
        'payment_id'        => $payment->id,
        'name'   => $request->name,
        'email'  => $request->email,
        'no_hp'  => $request->no_hp,
        'gender' => strtolower($request->gender),
    ]);

    /* ===== 3. EMAIL INSTRUKSI ===== */
    // Ambil ulang payment lengkap beserta relasi yang dibutuhkan
    $payment = Payment::with([
        'fitrahZakat.session.village'
    ])->findOrFail($payment->id);

    // Baru kirim email
    Mail::to($request->email)->send(new InstructionMail($payment));

    /* ===== 4. Bersihkan draft & redirect ===== */
    session()->forget("zakat.fitrah.{$request->sid}");

    return redirect()->route('payment.view', ['id'=>$payment->id]);
}
/* ---------- STEP 4B: REST draft utk React ---------- */
public function apiDraft(string $sid)
{
    $draft = session("zakat.fitrah.$sid");
        return $draft
            ? response()->json($draft)
            : response()->json(['message'=>'Draft not found'], 404);
}

}
