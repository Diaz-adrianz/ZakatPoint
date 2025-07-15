import Container from '@/components/container';
import VisitorLayout from '@/layouts/visitor-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ZakatView from './zakat-view';

const PayZakatFitrah = () => {
    const { session, village } = usePage<{
        session: { id: number; title: string; rice_price: number };
        village?: { id: number; name: string };
    }>().props;

    const [zakatCalculated, setZakatCalculated] = useState(false);
    const [ricePrice, setRicePrice] = useState<number>(session.rice_price);
    const [dependents, setDependents] = useState<number>(1);
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [sid, setSid] = useState<string | null>(null);

    useEffect(() => {
        setAmount(dependents * 2.5 * ricePrice);
    }, [dependents, ricePrice]);

    const handlePayClick = async () => {
        try {
            setError(null);
            const res = await fetch('/fitrah-zakat/prepare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    dependents,
                    amount,
                    rice_price: ricePrice,
                    session_id: session.id,
                }),
            });

            const json = await res.json();
            if (json.success) {
                setSid(json.sid);
            } else {
                setError('Gagal memproses permintaan.');
            }
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan.');
        }
    };

    if (!session) {
        return (
            <VisitorLayout>
                <Container className="py-20 text-center">Memuat data…</Container>
            </VisitorLayout>
        );
    }

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

                <div className="w-full max-w-md space-y-4">
                    <h2 className="text-lg font-semibold">Kalkulator Zakat Fitrah</h2>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                            Jumlah tanggungan
                            <input
                                className="input mt-1"
                                type="number"
                                min="1"
                                value={dependents}
                                onChange={(e) => setDependents(parseInt(e.target.value))}
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
                        <button className="btn btn-primary mt-2" type="button" onClick={() => setZakatCalculated(true)}>
                            Hitung Zakat
                        </button>
                    </div>
                </div>

                {zakatCalculated && (
                    <div className="mt-6 w-full max-w-md space-y-4 text-center">
                        <p className="font-semibold">Total zakat: Rp {amount.toLocaleString('id-ID')}</p>
                        <button className="btn btn-success w-full" onClick={handlePayClick}>
                            Bayar Zakat
                        </button>
                    </div>
                )}
                {sid && <ZakatView type="fitrah" sid={sid} />}
            </Container>
        </VisitorLayout>
    );
};

export default PayZakatFitrah;
