import PaymentMethodSelector from '@/components/select-payment-method';
import { useEffect, useState } from 'react';

interface Props {
    village: { id: number; name: string } | null;
    csrf: string;
}

export default function PayZakatPenghasilan({ village, csrf }: Props) {
    const [form, setForm] = useState({
        income_month: '',
        income_plus: '',
        email: '',
        name: '',
        no_hp: '',
        gender: 'bapak',
    });

    const [result, setResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [payment, setPayment] = useState({
        method: 'manual_transfer',
        channel: '',
    });
    const [nisabInfo, setNisabInfo] = useState<{ gold_price: number; nisab_value: number } | null>(null);

    useEffect(() => {
        fetch('/income-zakat/nisab')
            .then((r) => r.json())
            .then(setNisabInfo)
            .catch(() => setNisabInfo(null));
    }, []);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch('/income-zakat/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({
                    income_month: parseFloat(form.income_month || '0'),
                    income_plus: parseFloat(form.income_plus || '0'),
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError('Gagal menghitung zakat. Silakan coba lagi.');
        }
    };

    const createPayment = async () => {
        const res = await fetch('/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf,
            },
            body: JSON.stringify({
                amount: result.amount,
                method: payment.method,
                channel: payment.channel,
                description: `Zakat Penghasilan ${new Date().toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                })}`,
            }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Gagal membuat pembayaran.');
        return { paymentId: data.payment_id, referenceId: data.reference_id };
    };

    const handlePay = async () => {
        if (!village || !result?.is_nisab) return;

        if (!form.name || !form.email || !form.no_hp || !payment.channel) {
            alert('Lengkapi data diri dan pilih metode pembayaran.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { paymentId, referenceId } = await createPayment();

            const res = await fetch('/income-zakat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({
                    ...form,
                    village_id: village.id,
                    income_month: parseFloat(form.income_month),
                    income_plus: parseFloat(form.income_plus),
                    amount: result.amount,
                    payment_id: paymentId,
                }),
            });

            const data = await res.json();
            if (data.success) {
                window.location.href = `/instruksi/${referenceId}`;
            } else {
                setError(data.message || 'Gagal mencatat zakat.');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat pembayaran.');
        } finally {
            setLoading(false);
        }
    };

    const goToStep2 = () => {
        if (!form.name || !form.email || !form.no_hp) {
            alert('Lengkapi data diri terlebih dahulu.');
            return;
        }
        setStep(2);
    };

    return (
        <form onSubmit={handleCalculate} className="space-y-3">
            {/* Input penghasilan */}
            <input
                className="input"
                placeholder="Penghasilan bulanan (Rp)"
                type="number"
                value={form.income_month}
                onChange={(e) => setForm({ ...form, income_month: e.target.value })}
            />
            <input
                className="input"
                placeholder="Bonus / THR (Rp)"
                type="number"
                value={form.income_plus}
                onChange={(e) => setForm({ ...form, income_plus: e.target.value })}
            />
            {nisabInfo && (
                <div className="text-sm text-gray-600">
                    Nisab bulanan saat ini:
                    <strong className="ml-1">Rp {nisabInfo.nisab_value.toLocaleString('id-ID')}</strong>
                    &nbsp; (harga emas {nisabInfo.gold_price.toLocaleString('id-ID')} / gr)
                </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={!village || loading}>
                Hitung Zakat
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result && (
                <div className="mt-4 text-center">
                    <p className={result.is_nisab ? 'text-green-600' : 'text-red-600'}>{result.message}</p>

                    {result.is_nisab && (
                        <>
                            <p className="text-lg">Zakat yang harus dibayar:</p>
                            <p className="text-2xl font-bold">Rp {result.amount.toLocaleString('id-ID')}</p>

                            {/* === STEP 1: Data Diri === */}
                            {step === 1 && (
                                <div className="mt-4 space-y-3 text-left">
                                    <input
                                        className="input"
                                        placeholder="Nama lengkap"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                    <input
                                        className="input"
                                        placeholder="Email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                    <input
                                        className="input"
                                        placeholder="No. HP"
                                        value={form.no_hp}
                                        onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                    />
                                    <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                                        <option value="bapak">Bapak</option>
                                        <option value="ibu">Ibu</option>
                                    </select>

                                    <button type="button" className="btn btn-secondary w-full" onClick={goToStep2}>
                                        Pilih Metode Pembayaran
                                    </button>
                                </div>
                            )}

                            {/* === STEP 2: Metode Pembayaran + Tombol Bayar === */}
                            {step === 2 && (
                                <div className="mt-4 space-y-3 text-left">
                                    <PaymentMethodSelector method={payment.method} channel={payment.channel} onChange={setPayment} />
                                    <button
                                        type="button"
                                        className="btn btn-success w-full"
                                        onClick={handlePay}
                                        disabled={loading || !payment.channel}
                                    >
                                        {loading ? 'Memproses...' : 'Bayar Zakat'}
                                    </button>

                                    <button type="button" className="btn btn-link w-full text-sm" onClick={() => setStep(1)}>
                                        ‹ Kembali ke Data Diri
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* {!result.is_nisab && (
                        <p className="text-sm text-gray-600">Nilai belum mencapai nisab Rp {result.nisab_value.toLocaleString('id-ID')}</p>
                    )} */}
                </div>
            )}
        </form>
    );
}
