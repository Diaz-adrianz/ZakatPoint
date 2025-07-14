import Container from '@/components/container';
import PaymentMethodSelector from '@/components/select-payment-method';
import VisitorLayout from '@/layouts/visitor-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const PayZakatFitrah = () => {
    const [zakatCalculated, setZakatCalculated] = useState(false);
    const { session, village } = usePage<{
        session: { id: number; title: string; rice_price: number };
        village?: { id: number; name: string };
    }>().props;

    if (!session) {
        return (
            <VisitorLayout>
                <Container className="py-20 text-center">Memuat data…</Container>
            </VisitorLayout>
        );
    }

    const [ricePrice, setRicePrice] = useState<number>(session.rice_price);
    const [form, setForm] = useState({
        dependents: 1,
        name: '',
        email: '',
        no_hp: '',
        gender: 'bapak',
    });
    const [amount, setAmount] = useState<number>(0);
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payment, setPayment] = useState({
        method: 'manual_transfer',
        channel: '',
    });

    /* hitung zakat otomatis */
    useEffect(() => {
        setAmount(form.dependents * 2.5 * ricePrice);
    }, [form.dependents, ricePrice]);

    /* buat payment */
    const createPayment = async () => {
        const res = await fetch('/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({
                amount,
                method: payment.method,
                channel: payment.channel,
                description: `Zakat Fitrah ${session.title}`,
            }),
        });
        const data = await res.json();
        console.log('createPayment response', data);
        if (!data.success) throw new Error(data.message || 'Gagal membuat payment');
        return { paymentId: data.payment_id, referenceId: data.reference_id };
    };

    /* submit zakat */
    const handleSubmit = async () => {
        if (!payment.channel) {
            alert('Pilih metode & channel pembayaran.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const { paymentId, referenceId } = await createPayment();

            if (!referenceId) {
                throw new Error('Gagal mendapatkan Reference ID pembayaran');
            }

            const res = await fetch('/fitrah-zakat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    ...form,
                    amount,
                    fitrah_session_id: session.id,
                    payment_id: paymentId,
                }),
            });

            const data = await res.json();
            if (data.success) {
                window.location.href = `/instruksi/${referenceId}`;
            } else {
                setError(data.message || 'Gagal mencatat zakat.');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    /* validasi sebelum step 2 */
    const toStep2 = () => {
        if (!form.name || !form.email || !form.no_hp) {
            alert('Lengkapi data diri terlebih dahulu.');
            return;
        }
        setStep(2);
    };

    return (
        <VisitorLayout>
            <Head title="Bayar Zakat Fitrah" />
            <Container className="flex flex-col items-center gap-6">
                <h1 className="typo-h1 text-center">Salurkan Zakat Fitrah Anda</h1>
                <p className="typo-p text-center text-muted-foreground">
                    Desa: {village?.name ?? '-'} <br />
                    Periode: {session.title} | Harga beras default: Rp {session.rice_price.toLocaleString('id-ID')} / kg
                </p>

                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* === STEP 1 === */}
                {step === 1 && (
                    <>
                        {/* Kalkulator Zakat Fitrah */}
                        <div className="w-full max-w-md space-y-4">
                            <h2 className="text-lg font-semibold">Kalkulator Zakat Fitrah</h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Jumlah tanggungan
                                    <input
                                        className="input mt-1"
                                        type="number"
                                        min="1"
                                        value={form.dependents}
                                        onChange={(e) => setForm({ ...form, dependents: parseInt(e.target.value) })}
                                    />
                                </label>
                                <label className="text-sm font-medium">
                                    Harga beras per kg
                                    <input
                                        className="input mt-1"
                                        type="number"
                                        min="1000"
                                        step="100"
                                        value={ricePrice}
                                        onChange={(e) => setRicePrice(parseInt(e.target.value))}
                                    />
                                </label>
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={() => {
                                        setAmount(form.dependents * 2.5 * ricePrice);
                                        setZakatCalculated(true);
                                    }}
                                    type="button"
                                >
                                    Hitung Zakat
                                </button>
                            </div>
                        </div>

                        {/* Setelah dihitung baru tampilkan form */}
                        {zakatCalculated && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    toStep2();
                                }}
                                className="mt-6 w-full max-w-md space-y-4"
                            >
                                <p className="text-center font-semibold">Total zakat: Rp {amount.toLocaleString('id-ID')}</p>
                                <input
                                    className="input"
                                    placeholder="Nama Lengkap"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                                <input
                                    className="input"
                                    placeholder="No. HP"
                                    value={form.no_hp}
                                    onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                />
                                <select
                                    className="input"
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value as 'bapak' | 'ibu' })}
                                >
                                    <option value="bapak">Bapak</option>
                                    <option value="ibu">Ibu</option>
                                </select>

                                <button className="btn btn-secondary w-full">Pilih Metode Pembayaran</button>
                            </form>
                        )}
                    </>
                )}

                {/* === STEP 2 === */}
                {step === 2 && (
                    <div className="w-full max-w-md space-y-4">
                        <PaymentMethodSelector method={payment.method} channel={payment.channel} onChange={setPayment} />

                        <p className="text-center font-semibold">Total zakat: Rp {amount.toLocaleString('id-ID')}</p>

                        <button className="btn btn-success w-full" onClick={handleSubmit} disabled={loading || !payment.channel}>
                            {loading ? 'Memproses…' : 'Bayar Zakat'}
                        </button>

                        <button className="btn btn-link w-full text-sm" onClick={() => setStep(1)}>
                            ‹ Kembali ke Data Diri
                        </button>
                    </div>
                )}
            </Container>
        </VisitorLayout>
    );
};

export default PayZakatFitrah;
