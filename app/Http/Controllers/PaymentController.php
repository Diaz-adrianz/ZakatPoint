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
        try {
            $notif = new Notification();
        } catch (\Exception $e) {
            error_log("Midtrans Notification Error: " . $e->getMessage());
            return response()->json(['message' => 'Invalid notification data'], 400);
        }
        
        $transactionStatus = $notif->transaction_status;
        $paymentType = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraudStatus = $notif->fraud_status;
        $statusCode = $notif->status_code;
        $grossAmount = $notif->gross_amount; 
        $transactionTime = $notif->transaction_time;
        $signatureKey = $notif->signature_key;

        $hashed = hash('sha512', $orderId . $statusCode . $grossAmount . Config::$serverKey);

        if ($hashed != $signatureKey) {
            error_log("Midtrans Webhook: Invalid signature key for Order ID: " . $orderId);
            return response()->json(['message' => 'Invalid signature key'], 403); // Forbidden
        }

        error_log("Midtrans Webhook Received for Order ID: " . $orderId .
                  ", Status: " . $transactionStatus .
                  ", Type: " . $paymentType .
                  ", Fraud: " . $fraudStatus);

        $payment = Payment::where('order_id', $orderId)->first();

        if (!$payment) {
            error_log("Midtrans Webhook: Payment with Order ID " . $orderId . " not found in database.");
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $newPaymentStatus = '';
        $message = '';

        switch ($transactionStatus) {
            case 'capture':
                if ($paymentType == 'credit_card') {
                    if ($fraudStatus == 'accept') {
                        $newPaymentStatus = 'SUCCESS';
                        $message = "Transaction order_id: " . $orderId . " successfully captured using " . $paymentType . " (Fraud: Accept)";
                    } else if ($fraudStatus == 'challenge') {
                        $newPaymentStatus = 'PENDING';
                        $message = "Transaction order_id: " . $orderId . " challenged using " . $paymentType;
                    } else {
                        $newPaymentStatus = 'FAILURE';
                        $message = "Transaction order_id: " . $orderId . " denied by fraud detection using " . $paymentType;
                    }
                } else { 
                    $newPaymentStatus = 'SUCCESS';
                    $message = "Transaction order_id: " . $orderId . " successfully captured using " . $paymentType;
                }
                break;
            case 'settlement':
                $newPaymentStatus = 'SUCCESS';
                $message = "Transaction order_id: " . $orderId . " successfully settled using " . $paymentType;
                break;
            case 'pending':
                $newPaymentStatus = 'PENDING';
                $message = "Waiting customer to finish transaction order_id: " . $orderId . " using " . $paymentType;
                break;
            case 'deny':
            case 'expire':
            case 'cancel':
                $newPaymentStatus = 'FAILURE';
                $message = "Payment using " . $paymentType . " for transaction order_id: " . $orderId . " is " . $transactionStatus . ".";
                break;
            case 'refund':
            case 'partial_refund':
                $newPaymentStatus = 'FAILURE';
                $message = "Transaction order_id: " . $orderId . " has been refunded.";
                break;
            default:
                $newPaymentStatus = 'FAILURE';
                $message = "Unhandled transaction status: " . $transactionStatus . " for order_id: " . $orderId;
                break;
        }

        $payment->status = $newPaymentStatus;
        $payment->payment_type = $paymentType;
        $payment->amount = $grossAmount; 
        $payment->status_update_at = $transactionTime;
        $payment->save();

        echo $message;

        return response()->json(['message' => 'Notification received and processed', 'status' => $newPaymentStatus], 200);
    }
}
