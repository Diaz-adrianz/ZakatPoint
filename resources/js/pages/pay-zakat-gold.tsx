import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMoney } from '@/lib/utils';
import { AlertTriangleIcon, GemIcon, UserCircleIcon } from 'lucide-react';
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={calcZakat} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label>Berat emas (gram)</Label>
                    <Input type="number" placeholder="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                {goldInfo && (
                    <Alert variant="info">
                        <GemIcon />
                        <AlertTitle>Nisab</AlertTitle>
                        <AlertDescription>
                            Nisab ≈ {formatMoney(goldInfo.nisab_value)}
                            &nbsp;(emas {goldInfo.price_per_gram.toLocaleString('id-ID')} / gr)
                        </AlertDescription>
                    </Alert>
                )}
                <Button variant={result?.is_nisab ? 'secondary' : 'default'} disabled={!village}>
                    Hitung Zakat
                </Button>

                {result && goldInfo && (
                    <Alert variant="info">
                        <UserCircleIcon />
                        <AlertTitle>Emas Anda</AlertTitle>
                        <AlertDescription>
                            Harga emas Anda: {parseFloat(weight).toLocaleString('id-ID')} gr × Rp {goldInfo.price_per_gram.toLocaleString('id-ID')} =
                            Rp {(parseFloat(weight) * goldInfo.price_per_gram).toLocaleString('id-ID')}
                        </AlertDescription>
                    </Alert>
                )}

                {result && !result.is_nisab && (
                    <Alert variant="destructive">
                        <AlertTriangleIcon />
                        <AlertTitle>Nisab</AlertTitle>
                        <AlertDescription>
                            {result.amount === 0
                                ? 'Harga emas belum mencapai nisab.'
                                : 'Harga emas belum mencapai nisab; Anda belum wajib membayar zakat.'}
                        </AlertDescription>
                    </Alert>
                )}
            </form>

            {error && 
                <Alert variant="destructive">
                    <AlertTriangleIcon />
                    <AlertTitle>Terjadi kesalahan</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            }
            
            {result?.is_nisab && (
                <div className="border p-3 rounded-md bg-primary/15 border-primary/40 text-center text-primary">
                    <h4 className="typo-h4 mb-3">Harga emas Anda mencapai nisab.<br />Anda wajib bayar zakat.</h4>
                    <p className="typo-p">Zakat yang harus dibayar</p>
                    <h1 className="typo-h1 animate-pulse">{formatMoney(result.amount, {shorten: false})}</h1>
                    <Button className="mt-6 w-full" size={'lg'} onClick={handlePrepare} disabled={loading}>
                        {loading ? 'Memproses…' : 'Bayar Zakat'}
                    </Button>
                </div>
            )}
            {sid && <ZakatView type="gold" sid={sid} />}
        </div>
    );
}
