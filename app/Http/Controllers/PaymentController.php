<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Helpers\MidtransHelper;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    public function view($id) 
    {
        $payment = Payment::where('id', $id)
            ->select([
                'id',
                'order_id',
                'amount',
                'status',
                'payment_type',
                'snap_token',
                'first_name',
                'last_name',
                'expired_at',
                'status_update_at',
                'created_at',
                'updated_at'
            ])
            ->with('items')
            ->first();

        return Inertia::render('payment-view', [
            'payment' => $payment,
        ]);
    }

    public function store($data, $items, $expiryHour)
    {
        DB::beginTransaction();
        try {
            $orderId = 'TRX-' . uniqid();

            $expiryAt = now()->addHours($expiryHour);

            $paymentData = [
                'order_id' => $orderId,
                'amount' => $data['amount'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'] ?? null,
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'expired_at' => $expiryAt,
                'status_update_at' => now(),
            ];

            $payment = Payment::create($paymentData);

            $midtransItemDetails = [];
            foreach ($items as $item) {
                $payment->items()->create([
                    'item_id' => $item['item_id'],
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'] ?? 1,
                    'brand' => $item['brand'] ?? null,
                    'category' => $item['category'] ?? null,
                    'merchant_name' => $item['merchant_name'] ?? null,
                    'url' => $item['url'] ?? null,
                ]);
                $midtransItemDetails[] = [
                    'id' => $item['item_id'],
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'] ?? 1,
                    'brand' => $item['brand'] ?? null,
                    'category' => $item['category'] ?? null,
                    'merchant_name' => $item['merchant_name'] ?? null,
                    'url' => $item['url'] ?? null,
                ];
            }

            $midtransData = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $data['amount'],
                ],
                'customer_details' => [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'] ?? null,
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                ],
                'item_details' => $midtransItemDetails,
                'page_expiry' => [
                    'duration' => $expiryHour,
                    'unit' => 'hours'
                ]
            ];

            $snapToken = Snap::getSnapToken($midtransData);

            if ($snapToken) {
                $payment->snap_token = $snapToken;
                $payment->save();

                DB::commit();
                return $payment;
            } else {
                DB::rollBack();
            }
        } catch (\Exception $e) {
            DB::rollBack();
        }
    }

    public function handleMidtransWebhook(Request $request)
    {
        $serverKey = config('midtrans.server_key');

        $signatureKey = hash("sha512",
            $request->order_id .
            $request->status_code .
            $request->gross_amount .
            $serverKey
        );

        if ($signatureKey !== $request->signature_key) {
            return response()->json(['message' => 'Invalid signature key'], 403);
        }

        $payment = Payment::where('order_id', $request->order_id)->first();

        if (!$payment) {
            Log::error("hello");
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($request->transaction_status == 'settlement' || $request->transaction_status == 'capture') {
            $payment->status = 'SUCCESS';
        } elseif ($request->transaction_status == 'cancel' || $request->transaction_status == 'expire') {
            $payment->status = 'FAILURE';
        } elseif ($request->transaction_status == 'pending') {
            $payment->status = 'PENDING';
        }

        $payment->payment_type = $request->payment_type;
        $payment->save();

        return response()->json(['message' => 'Webhook processed successfully']);
    }
}
