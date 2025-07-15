import { useEffect, useState } from 'react';
import ZakatView from './zakat-view';

interface Props {
    village: { id: number; name: string } | null;
    csrf: string;
}

export default function PayZakatGold({ village, csrf }: Props) {
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<{ is_nisab: boolean; amount: number } | null>(null);
    const [goldInfo, setGoldInfo] = useState<{ price_per_gram: number; nisab_value: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sid, setSid] = useState<string | null>(null);

    /* --- ambil harga emas & nisab --- */
    useEffect(() => {
        fetch('/gold-price')
            .then((r) => r.json())
            .then(setGoldInfo)
            .catch(() => setGoldInfo(null));
    }, []);

    /* --- kalkulasi zakat --- */
    async function calcZakat(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            const r = await fetch('/gold-zakat/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ weight: parseFloat(weight || '0') }),
            });
            setResult(await r.json());
        } catch {
            setError('Gagal menghitung zakat.');
        }
    }

    /* --- prepare & redirect --- */
    async function handlePrepare() {
        if (!village || !result?.is_nisab) return;
        setLoading(true);
        setError(null);
        try {
            const r = await fetch('/gold-zakat/prepare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({
                    weight: parseFloat(weight),
                    amount: result.amount, // ← WAJIB sesuai validasi backend
                    village_id: village.id,
                }),
            });
            const j = await r.json();
            if (j.success) setSid(j.sid);
            else setError(j.message || 'Gagal membuat transaksi.');
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={calcZakat} className="space-y-3">
                <input className="input" type="number" placeholder="Berat emas (gram)" value={weight} onChange={(e) => setWeight(e.target.value)} />
                {goldInfo && (
                    <small className="block text-muted-foreground">
                        Nisab ≈ Rp {goldInfo.nisab_value.toLocaleString('id-ID')}
                        &nbsp;(harga {goldInfo.price_per_gram.toLocaleString('id-ID')} / gr)
                    </small>
                )}
                <button className="btn btn-primary w-full" disabled={!village}>
                    Hitung Zakat
                </button>
                {result && goldInfo && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Harga emas Anda: {parseFloat(weight).toLocaleString('id-ID')} gr × Rp {goldInfo.price_per_gram.toLocaleString('id-ID')} =
                            Rp {(parseFloat(weight) * goldInfo.price_per_gram).toLocaleString('id-ID')}
                        </p>
                    </div>
                )}

                {result && !result.is_nisab && (
                    <div className="space-y-3 text-center text-sm text-muted-foreground">
                        <p>
                            {result.amount === 0
                                ? 'Harga emas belum mencapai nisab.'
                                : 'Harga emas belum mencapai nisab; Anda belum wajib membayar zakat.'}
                        </p>
                    </div>
                )}
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result?.is_nisab && (
                <div className="space-y-3 text-center">
                    <p className="text-lg">Harga emas anda mencapai nisab.</p>
                    <p className="text-lg">Anda wajib bayar zakat.</p>
                    <p className="text-lg font-semibold">Zakat yang harus dibayar</p>
                    <p className="text-2xl font-bold">Rp {result.amount.toLocaleString('id-ID')}</p>
                    <button className="btn btn-success w-full" onClick={handlePrepare} disabled={loading}>
                        {loading ? 'Memproses…' : 'Bayar Zakat'}
                    </button>
                </div>
            )}
            {sid && <ZakatView type="gold" sid={sid} />}
        </div>
    );
}
