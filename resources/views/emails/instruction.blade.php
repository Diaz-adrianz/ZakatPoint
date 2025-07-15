@component('mail::message')
# Konfirmasi Pembayaran

@component('mail::panel')
**Penerima**  
{{ $payment->first_name }} {{ $payment->last_name }}

**Metode Pembayaran**  
{{ $payment->payment_type ?? '-' }}

**Status**  
{{ strtoupper($payment->status) }}

**Tenggat**  
{{ $payment->expired_at }}
@endcomponent

@foreach ($payment->items ?? [] as $item)
**{{ $item['name'] }}**  
Rp {{ number_format($item['price'], 0, ',', '.') }}

@endforeach

**Total**  
# Rp {{ number_format($payment->amount, 0, ',', '.') }}

@component('mail::button', ['url' => route('payment.view', $payment->id)])
Lihat Instruksi Pembayaran
@endcomponent

@endcomponent
