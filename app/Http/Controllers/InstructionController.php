<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstructionController extends Controller
{
    public function show(Payment $payment)
    {
        $zakatType = $this->getZakatType($payment->description);
        $village = null;

        // Ambil desa dari model zakat yang sesuai
        switch ($zakatType) {
            case 'Zakat Fitrah':
                $zakat = $payment->fitrahZakat;
                if ($zakat && $zakat->session && $zakat->session->village) {
                    $village = [
                        'name' => $zakat->session->village->village,
                        'email' => $zakat->session->village->email_village,
                    ];
                }
                break;
            case 'Zakat Emas':
                $zakat = $payment->goldZakat;
                break;
            case 'Zakat Penghasilan':
                $zakat = $payment->incomeZakat;
                break;
            case 'Zakat Perak':
                $zakat = $payment->silverZakat;
                break;
            default:
                $zakat = null;
        }

        if ($zakat && $zakat->village) {
            $village = [
                'name' => $zakat->village->village,
                'email' => $zakat->village->email_village,
            ];
        }

        return Inertia::render('pay-instructions', [
            'payment' => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'description' => $payment->description,
                'method' => $payment->method,
                'channel' => $payment->channel,
            ],
            'zakatType' => $zakatType,
            'village' => $village, // ← ini bisa kamu pakai di view
        ]);
    }

    private function getZakatType($desc)
    {
        if (str_contains($desc, 'Fitrah')) return 'Zakat Fitrah';
        if (str_contains($desc, 'Emas')) return 'Zakat Emas';
        if (str_contains($desc, 'Penghasilan')) return 'Zakat Penghasilan';
        if (str_contains($desc, 'Perak')) return 'Zakat Perak';
        return 'Zakat';
    }
}
