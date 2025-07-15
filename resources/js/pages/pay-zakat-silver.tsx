import { useEffect, useState } from 'react';
import ZakatView from './zakat-view';

interface Props {
    village: { id: number; name: string } | null;
    csrf: string;
}

export default function PayZakatSilver({ village, csrf }: Props) {
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<{ is_nisab: boolean; amount: number } | null>(null);
    const [silverInfo, setSilverInfo] = useState<{ price_per_gram: number; nisab_value: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sid, setSid] = useState<string | null>(null);

    /* --- ambil harga perak & nisab --- */
    useEffect(() => {
        fetch('/silver-price')
            .then((r) => r.json())
            .then(setSilverInfo)
            .catch(() => setSilverInfo(null));
    }, []);

    /* --- kalkulasi zakat --- */
    async function calcZakat(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            const r = await fetch('/silver-zakat/calculate', {
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
            const r = await fetch('/silver-zakat/prepare', {
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
                <input className="input" type="number" placeholder="Berat perak (gram)" value={weight} onChange={(e) => setWeight(e.target.value)} />
                {silverInfo && (
                    <small className="block text-muted-foreground">
                        Nisab ≈ Rp {silverInfo.nisab_value.toLocaleString('id-ID')}
                        &nbsp;(harga {silverInfo.price_per_gram.toLocaleString('id-ID')} / gr)
                    </small>
                )}
                <button className="btn btn-primary w-full" disabled={!village}>
                    Hitung Zakat
                </button>
                {result && silverInfo && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Harga perak Anda: {parseFloat(weight).toLocaleString('id-ID')} gr × Rp {silverInfo.price_per_gram.toLocaleString('id-ID')}{' '}
                            = Rp {(parseFloat(weight) * silverInfo.price_per_gram).toLocaleString('id-ID')}
                        </p>
                    </div>
                )}

                {result && !result.is_nisab && (
                    <div className="space-y-3 text-center text-sm text-muted-foreground">
                        <p>
                            {result.amount === 0
                                ? 'Harga perak belum mencapai nisab.'
                                : 'Harga perak belum mencapai nisab; Anda belum wajib membayar zakat.'}
                        </p>
                    </div>
                )}
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result?.is_nisab && (
                <div className="space-y-3 text-center">
                    <p className="text-lg">Harga perak Anda mencapai nisab.</p>
                    <p className="text-lg">Anda wajib bayar zakat.</p>
                    <p className="text-lg font-semibold">Zakat yang harus dibayar</p>
                    <p className="text-2xl font-bold">Rp {result.amount.toLocaleString('id-ID')}</p>
                    <button className="btn btn-success w-full" onClick={handlePrepare} disabled={loading}>
                        {loading ? 'Memproses…' : 'Bayar Zakat'}
                    </button>
                </div>
            )}
            {sid && <ZakatView type="silver" sid={sid} />}
        </div>
    );
}
