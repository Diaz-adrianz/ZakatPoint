import { useEffect, useState } from 'react';
import ZakatView from './zakat-view';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangleIcon, GemIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/utils';

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={calcZakat} className="flex flex-col space-y-6">
                <div className="grid gap-2">
                    <Label>Penghasilan bulanan</Label>
                    <Input
                        type="number"
                        placeholder="Penghasilan Bulanan (Rp)"
                        required
                        value={incomeMonth}
                        onChange={(e) => setIncomeMonth(e.target.value)}
                    />
                    <small className="!typo-small text-muted-foreground">{formatMoney(+incomeMonth)}</small>
                </div>
                <div className="grid gap-2">
                    <Label>Bonus / THR (Rp)</Label>
                    <Input
                        type="number"
                        required
                        placeholder="Bonus / THR (Rp)"
                        value={incomePlus}
                        onChange={(e) => setIncomePlus(e.target.value)}
                    />
                    <small className="!typo-small text-muted-foreground">{formatMoney(+incomePlus)}</small>
                </div>
                {nisabInfo && (
                    <Alert variant="default" className='bg-blue-500/15 text-blue-500 border-blue-500/40'>
                        <GemIcon />
                        <AlertTitle>Nisab</AlertTitle>
                        <AlertDescription className='text-blue-500/80'>
                            Nisab ≈ Rp {nisabInfo.nisab_value.toLocaleString('id-ID')}
                            &nbsp;(emas {nisabInfo.gold_price.toLocaleString('id-ID')} / gr)
                        </AlertDescription>
                    </Alert>
                )}
                <Button variant={result?.is_nisab ? 'secondary' : 'default'} disabled={!village}>
                    Hitung Zakat
                </Button>
                {result && !result.is_nisab && (
                    <Alert variant="destructive">
                        <AlertTriangleIcon />
                        <AlertTitle>Nisab</AlertTitle>
                        <AlertDescription>
                            {result.amount === 0
                                ? 'Penghasilan belum mencapai nisab.'
                                : 'Penghasilan belum mencapai nisab; Anda belum wajib membayar zakat.'}
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

            {result && result.is_nisab && (
                <div className="border p-3 rounded-md bg-primary/15 border-primary/40 text-center text-primary">
                    <h4 className="typo-h4 mb-3">Penghasilan Anda mencapai nisab.<br />Anda wajib bayar zakat.</h4>
                    <p className="typo-p">Zakat yang harus dibayar</p>
                    <h1 className="typo-h1 animate-pulse">{formatMoney(result.amount, {shorten: false})}</h1>
                    <Button className="mt-6 w-full" size={'lg'} type='button' onClick={handlePrepare} disabled={loading}>
                        {loading ? 'Memproses…' : 'Bayar Zakat'}
                    </Button>
                </div>
            )}
            {sid && <ZakatView type="income" sid={sid} />}
        </div>
    );
}
