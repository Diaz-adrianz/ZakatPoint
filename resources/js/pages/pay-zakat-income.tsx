import { useEffect, useState } from 'react';
import ZakatView from './zakat-view';

interface Props {
    village: { id: number; name: string } | null;
    csrf: string;
}

export default function PayZakatPenghasilan({ village, csrf }: Props) {
    const [incomeMonth, setIncomeMonth] = useState('');
    const [incomePlus, setIncomePlus] = useState('');
    const [result, setResult] = useState<{ is_nisab: boolean; amount: number } | null>(null);
    const [nisabInfo, setNisabInfo] = useState<{ gold_price: number; nisab_value: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sid, setSid] = useState<string | null>(null);

    // Ambil nisab saat load
    useEffect(() => {
        fetch('/income-zakat/nisab')
            .then((r) => r.json())
            .then(setNisabInfo)
            .catch(() => setNisabInfo(null));
    }, []);

    // Kalkulasi zakat
    async function calcZakat(e: React.FormEvent) {
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
                    income_month: parseFloat(incomeMonth || '0'),
                    income_plus: parseFloat(incomePlus || '0'),
                }),
            });
            const json = await res.json();
            setResult(json);
        } catch {
            setError('Gagal menghitung zakat.');
        }
    }

    // Prepare & redirect ke halaman identitas
    async function handlePrepare() {
        if (!village || !result?.is_nisab) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/income-zakat/prepare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({
                    income_month: parseFloat(incomeMonth),
                    income_plus: parseFloat(incomePlus),
                    village_id: village?.id,
                }),
            });
            const json = await res.json();
            if (json.success) {
                setSid(json.sid);
            } else {
                setError(json.message || 'Gagal membuat transaksi.');
            }
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={calcZakat} className="space-y-3">
                <input
                    className="input"
                    type="number"
                    placeholder="Penghasilan Bulanan (Rp)"
                    value={incomeMonth}
                    onChange={(e) => setIncomeMonth(e.target.value)}
                />
                <input
                    className="input"
                    type="number"
                    placeholder="Bonus / THR (Rp)"
                    value={incomePlus}
                    onChange={(e) => setIncomePlus(e.target.value)}
                />
                {nisabInfo && (
                    <small className="block text-muted-foreground">
                        Nisab ≈ Rp {nisabInfo.nisab_value.toLocaleString('id-ID')}
                        &nbsp;(emas {nisabInfo.gold_price.toLocaleString('id-ID')} / gr)
                    </small>
                )}
                <button className="btn btn-primary w-full" disabled={!village}>
                    Hitung Zakat
                </button>
                {result && !result.is_nisab && (
                    <div className="space-y-3 text-center text-sm text-muted-foreground">
                        <p>
                            {result.amount === 0
                                ? 'Penghasilan belum mencapai nisab.'
                                : 'Penghasilan belum mencapai nisab; Anda belum wajib membayar zakat.'}
                        </p>
                    </div>
                )}
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result && result.is_nisab && (
                <div className="space-y-3 text-center">
                    <p className="text-lg">Penghasilan Anda mencapai nisab.</p>
                    <p className="text-lg">Anda wajib bayar zakat.</p>
                    <p className="text-lg font-semibold">Zakat yang harus dibayar</p>
                    <p className="text-2xl font-bold">Rp {result.amount.toLocaleString('id-ID')}</p>
                    <button className="btn btn-success w-full" onClick={handlePrepare} disabled={loading}>
                        {loading ? 'Memproses…' : 'Bayar Zakat'}
                    </button>
                </div>
            )}
            {sid && <ZakatView type="income" sid={sid} />}
        </div>
    );
}
