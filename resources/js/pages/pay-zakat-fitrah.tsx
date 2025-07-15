import Container from '@/components/container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VisitorLayout from '@/layouts/visitor-layout';
import { formatMoney } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import { AlertTriangleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ZakatView from './zakat-view';
import { Button } from '@/components/ui/button';

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
        setAmount(dependents * (2.5 * ricePrice));
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            </Container>
            <Container className="flex max-w-lg flex-col gap-6 rounded-md border">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <p className="typo-p text-muted-foreground">Desa</p>
                        <h4 className="typo-h4">{village?.name}</h4>
                    </div>
                    <div>
                        <p className="typo-p text-muted-foreground">Periode</p>
                        <h4 className="typo-h4">{session.title}</h4>
                    </div>
                    <div>
                        <p className="typo-p text-muted-foreground">Harga beras per 1 sha'</p>
                        <h4 className="typo-h4">{formatMoney(session.rice_price)}</h4>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangleIcon />
                        <AlertTitle>Terjadi kesalahan</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label>Jumlah tanggungan</Label>
                        <Input type="number" min={1} value={dependents} onChange={(e) => setDependents(+e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Harga beras per kg</Label>
                        <Input type="number" min="1000" step="100" value={ricePrice} onChange={(e) => setRicePrice(parseInt(e.target.value))} />
                        <small className="!typo-small text-muted-foreground">{formatMoney(+ricePrice)}</small>
                        <small className="!typo-small text-muted-foreground">Anda dapat menyesuaikan kembali dengan harga beras yang biasa Anda beli</small>
                    </div>
                    <Button variant={zakatCalculated ? 'secondary' : 'default'} type='button' onClick={() => setZakatCalculated(true)}>
                        Hitung Zakat
                    </Button>
                </div>

                {zakatCalculated && (
                    <div className="border p-3 rounded-md bg-primary/15 border-primary/40 text-center text-primary">
                        <p className="typo-p">Zakat yang harus dibayar</p>
                        <h1 className="typo-h1 animate-pulse">{formatMoney(amount, {shorten: false})}</h1>
                        <Button className="mt-6 w-full" size={'lg'} onClick={handlePayClick}>
                            Bayar Zakat
                        </Button>
                    </div>
                )}
                {sid && <ZakatView type="fitrah" sid={sid} />}
            </Container>
        </VisitorLayout>
    );
};

export default PayZakatFitrah;
