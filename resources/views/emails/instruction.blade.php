@component('mail::message')
# Assalamu'alaikum

Terima kasih telah menunaikan niat {{ $zakatType }}.

Jumlah yang harus dibayarkan:  
**Rp {{ number_format($payment->amount, 0, ',', '.') }}**

Silakan transfer ke:

**BCA 123456789**  
a.n. Panitia Zakat  
Metode: {{ strtoupper($payment->channel) }}

@component('mail::button', ['url' => url('/instruksi/' . $payment->reference_id)])
Lihat Instruksi Pembayaran
@endcomponent

<p>
    Email ini dikirim atas nama:
    <strong>{{ $village['name'] ?? '-' }}</strong>
    ({{ $village['email'] ?? '-' }})
</p>

Jazakumullah khayran.
@endcomponent
