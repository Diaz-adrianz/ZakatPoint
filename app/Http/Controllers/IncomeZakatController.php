<?php

namespace App\Http\Controllers;

use App\Helpers\MetalPriceHelper;
use App\Mail\InstructionMail;
use App\Models\IncomeZakat;
use Inertia\Inertia;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class IncomeZakatController extends Controller
{
    public function list(Request $request) {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);
        $villageId = $request->cookie('village_id');

        $query = IncomeZakat::query();

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

        $sumAllAmount = IncomeZakat::where('village_id', $villageId)
                                ->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                })            
                                ->sum('amount');

        return Inertia::render('zakat-income-list', [
            'zakats' => $zakats,
            'sumAllAmount' => $sumAllAmount,
            'query' => [
                'search' => $search,
            ]
        ]);
    }
    /* ========= 1. Kalkulator ========= */
    /**
     * Hitung zakat saja (dipakai kalkulator di FE, tidak menyimpan).
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'income_month' => 'required|numeric|min:0',
            'income_plus'  => 'required|numeric|min:0',
        ]);

        $goldPrice    = MetalPriceHelper::getGoldToday();       
        $nisabBulanan = (85 * $goldPrice) / 12;                 
        $totalIncome  = $validated['income_month'] + $validated['income_plus'];
        $isNisab      = $totalIncome >= $nisabBulanan;
        $amount       = $isNisab ? $totalIncome * 0.025 : 0;

        return response()->json([
            'gold_price' => round($goldPrice),
            'is_nisab'   => $isNisab,
            'amount'     => round($amount),
            'message'    => $isNisab
                ? 'Anda wajib membayar zakat.'
                : 'Belum wajib zakat karena belum mencapai nisab.',
        ]);
    }

    /* ========= 2. Simpan ke session ========= */
    public function prepare(Request $request)
    {
        $validated = $request->validate([
            'income_month' => 'required|numeric|min:0',
            'income_plus'  => 'required|numeric|min:0',
            'village_id'   => 'required|exists:villages,id',
        ]);

        $goldPrice    = MetalPriceHelper::getGoldToday();
        $nisabBulanan = (85 * $goldPrice) / 12;
        $totalIncome  = $validated['income_month'] + $validated['income_plus'];

        if ($totalIncome < $nisabBulanan) {
            return response()->json([
                'success' => false,
                'message' => 'Penghasilan belum mencapai nisab.',
            ], 422);
        }

        $amount = round($totalIncome * 0.025);
        $id   = (string) Str::uuid(); // SID
        $type = 'income'; // karena ini controller zakat penghasilan

        session()->put("zakat.$type.$id", array_merge($validated, [
            'amount' => $amount,
        ]));

        return response()->json([
            'success' => true,
            'sid' => $id,
        ]);
    }

    /* ========= 4. Proses & bayar ========= */
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

        $draft = session("zakat.income.{$validated['sid']}");
        abort_if(!$draft, 404);

        /* ===== 1. Buat Payment ===== */
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
                    'item_id'  => 'income_zakat',
                    'name'     => 'Zakat Penghasilan',
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

        /* ===== 2. Simpan zakat ===== */
        IncomeZakat::create([
            'income_month' => $draft['income_month'],
            'income_plus'  => $draft['income_plus'],
            'amount'       => $draft['amount'],
            'payment_id'   => $payment->id,
            'name'         => $validated['name'],
            'email'        => $validated['email'],
            'no_hp'        => $validated['no_hp'],
            'gender'       => $validated['gender'],
            'village_id'   => $validated['village_id'],
            'payment_id'   => $payment->id,
        ]);

        /* ===== 3. Kirim email ===== */
        $payment = Payment::with('incomeZakat.village')->findOrFail($payment->id);
        Mail::to($validated['email'])->send(new InstructionMail($payment));

        /* ===== 4. Hapus draft & redirect ===== */
        session()->forget("zakat.income.{$validated['sid']}");

        return redirect()->route('payment.view', ['id' => $payment->id]);
    }
    /* ---------- STEP 4B: REST draft utk React ---------- */
    public function apiDraft(string $sid)
    {
        $draft = session("zakat.income.$sid");
        return $draft
            ? response()->json($draft)
            : response()->json(['message'=>'Draft not found'], 404);
    }
}
