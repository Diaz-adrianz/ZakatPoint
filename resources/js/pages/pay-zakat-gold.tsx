import PaymentMethodSelector from '@/components/select-payment-method';
import { useEffect, useState } from 'react';

interface Props {
    village: { id: number; name: string } | null;
    csrf: string;
}

export default function PayZakatEmas({ village, csrf }: Props) {
    const [form, setForm] = useState({
        weight: '',
        email: '',
        name: '',
        no_hp: '',
        gender: 'bapak',
    });
    const [result, setResult] = useState<any | null>(null);
    const [goldPrice, setGoldPrice] = useState<{ price_per_gram: number; nisab_value: number } | null>(null);
    useEffect(() => {
        fetch('/gold-price')
            .then((r) => r.json())
            .then(setGoldPrice)
            .catch(() => setGoldPrice(null));
    }, []);
    const totalValue = goldPrice?.price_per_gram && form.weight ? parseFloat(form.weight) * goldPrice.price_per_gram : 0;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [payment, setPayment] = useState({
        method: 'manual_transfer',
        channel: '',
    });

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await fetch('/gold-zakat/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
            },
            body: JSON.stringify({
                weight: parseFloat(form.weight || '0'),
            }),
        });
        const data = await res.json();
        setResult(data);
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
                description: `Zakat Emas ${new Date().toLocaleDateString('id-ID', {
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

            const res = await fetch('/gold-zakat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({
                    ...form,
                    village_id: village.id,
                    weight: parseFloat(form.weight || '0'),
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
            <div className="mt-4 text-center">
                {/* Harga 1 gram */}
                <p className="text-sm text-gray-600">
                    Harga emas hari ini:{' '}
                    <strong>Rp {goldPrice?.price_per_gram ? goldPrice.price_per_gram.toLocaleString('id-ID') : '...'} / gram</strong>
                </p>
            </div>
            <input
                className="input"
                placeholder="Berat Emas (gram)"
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
            {goldPrice && (
                <div className="text-sm text-gray-600">
                    Nisab zakat emas saat ini:
                    <strong className="ml-1">Rp {goldPrice.nisab_value.toLocaleString('id-ID')}</strong>
                </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={!village}>
                Hitung Zakat
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result && (
                <div className="mt-4 text-center">
                    {/* Nilai emas user */}
                    <p className="text-sm text-gray-600">
                        Nilai emas Anda ({form.weight || 0}&nbsp;gram): <strong>Rp {totalValue.toLocaleString('id-ID')}</strong>
                    </p>

                    <p className={result.is_nisab ? 'text-green-600' : 'text-red-600'}>{result.message}</p>

                    {result.is_nisab && (
                        <>
                            <p className="text-lg">Zakat yang harus dibayar:</p>
                            <p className="text-2xl font-bold">Rp {result.amount.toLocaleString('id-ID')}</p>

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
