<?php

namespace App\Http\Controllers;

use App\Helpers\MetalPriceHelper;
use App\Mail\InstructionMail;
use App\Models\GoldZakat;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class GoldZakatController extends Controller
{
    public function list(Request $request) {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);
        $villageId = $request->cookie('village_id');

        $query = GoldZakat::query();

        if ($villageId) {
            $query->where("village_id", $villageId);
        }

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('no_hp', 'like', '%' . $search . '%')
                  ->orWhere('gender', 'like', '%' . $search . '%');
        }

        $zakats = $query->orderBy('created_at', 'desc')->paginate($limit);

        $sumAllAmount = GoldZakat::where('village_id', $villageId)
                                ->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                })            
                                ->sum('amount');

        return Inertia::render('zakat-gold-list', [
            'zakats' => $zakats,
            'sumAllAmount' => $sumAllAmount,
            'query' => [
                'search' => $search,
            ]
        ]);
    }

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


     public function prepare(Request $request)
{
    $request->validate([
        'weight' => 'required|numeric|min:0',
        'amount' => 'required|numeric|min:0',
        'village_id' => 'required|exists:villages,id',
    ]);

    $sid = uniqid('gold_');
    session(["zakat.gold.$sid" => [
        'weight'     => $request->weight,
        'amount'     => $request->amount,
        'village_id' => $request->village_id,
    ]]);

    return response()->json(['success' => true, 'sid' => $sid]);
}

public function pay(Request $request)
{
    $validated = $request->validate([
        'sid'        => 'required|string',
        'name'       => 'required|string|max:255',
        'email'      => 'required|email',
        'no_hp'      => 'required|string|max:30',
        'gender'     => 'required|in:Bapak,Ibu',
        'village_id' => 'required|exists:villages,id',
    ]);

    $draft = session("zakat.gold.{$validated['sid']}");
    abort_if(!$draft, 404);

    // Buat payment
    $paymentCtrl = new PaymentController();
    $payment = $paymentCtrl->store(
        [
            'amount'     => $draft['amount'],
            'first_name' => $validated['name'],
            'email'      => $validated['email'],
            'phone'      => $validated['no_hp'],
        ],
        [
            [
                'item_id'  => 'gold_zakat',
                'name'     => 'Zakat Emas',
                'price'    => $draft['amount'],
                'quantity' => 1,
                'category' => 'zakat',
            ],
        ],
        2
    );

    if (!$payment) {
        return back()->withErrors(['error' => 'Gagal membuat transaksi.']);
    }

    GoldZakat::create([
        'weight'     => $draft['weight'],
        'amount'     => $draft['amount'],
        'payment_id' => $payment->id,
        'name'       => $validated['name'],
        'email'      => $validated['email'],
        'no_hp'      => $validated['no_hp'],
        'gender'     => $validated['gender'],
        'village_id' => $validated['village_id'],
    ]);

    $payment = Payment::with('goldZakat.village')->findOrFail($payment->id);
    Mail::to($validated['email'])->send(new InstructionMail($payment));

    session()->forget("zakat.gold.{$validated['sid']}");

    return redirect()->route('payment.view', ['id' => $payment->id]);
}
/* ---------- STEP 4B: REST draft utk React ---------- */
public function apiDraft(string $sid)
{
    $draft = session("zakat.gold.$sid");
        return $draft
            ? response()->json($draft)
            : response()->json(['message'=>'Draft not found'], 404);
}

}
