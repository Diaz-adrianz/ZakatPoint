<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InstructionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $payment;
    public $zakatType;
    public $village;   // ← tambah

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
        $this->zakatType = $this->determineType($payment->description ?? '');
        $this->village = $this->detectVillage($payment);

        // Pastikan items adalah array, bukan Collection atau json
        if (is_string($payment->items)) {
            $this->payment->items = json_decode($payment->items, true);
        }
    }

    public function build()
    {
        return $this->subject("Konfirmasi Pembayaran {$this->zakatType}")
                    ->markdown('emails.instruction', [
                        'payment'   => $this->payment,
                        'zakatType' => $this->zakatType,
                        'village'   => $this->village,   // ← kirim ke view
                    ]);
    }

    /* ---------- helper ---------- */

    private function determineType(string $desc): string
    {
        return str_contains($desc, 'Fitrah')      ? 'Zakat Fitrah'      :
               (str_contains($desc, 'Emas')       ? 'Zakat Emas'        :
               (str_contains($desc, 'Penghasilan')? 'Zakat Penghasilan' :
               (str_contains($desc, 'Perak')      ? 'Zakat Perak'       : 'Zakat')));
    }

    private function detectVillage(Payment $payment): ?array
    {
        if ($village = $payment->fitrahZakat?->session?->village) {
            return [
                'name'  => $village->village,
                'email' => $village->email_village,
            ];
        }
        if ($payment->goldZakat?->village) {
            return [
                'name'  => $payment->goldZakat->village->village,
                'email' => $payment->goldZakat->village->email_village,
            ];
        }
        if ($payment->incomeZakat?->village) {
            return [
                'name'  => $payment->incomeZakat->village->village,
                'email' => $payment->incomeZakat->village->email_village,
            ];
        }
        if ($payment->silverZakat?->village) {
            return [
                'name'  => $payment->silverZakat->village->village,
                'email' => $payment->silverZakat->village->email_village,
            ];
        }
        return null;
    }
}
