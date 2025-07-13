import Container from '@/components/container';
import VisitorLayout from '@/layouts/visitor-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const PayZakatFitrah = () => {
    const {
        session,
        village, // <-- datanya ada di props sekarang
    } = usePage<{
        session: { id: number; title: string; rice_price: number };
        village?: { id: number; name: string };
    }>().props;

    if (!session || !session.rice_price) {
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

    useEffect(() => {
        const kalkulasi = form.dependents * 2.5 * ricePrice;
        setAmount(kalkulasi);
    }, [form.dependents, ricePrice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const body = {
            ...form,
            amount,
            fitrah_session_id: session.id,
            payment_id: 1,
        };

        const res = await fetch('/fitrah-zakat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (data.success) {
            alert(`Zakat fitrah berhasil dicatat, ID: ${data.zakat_id}`);
            setForm({ dependents: 1, name: '', email: '', no_hp: '', gender: 'bapak' });
            setAmount(0);
        }
    };

    return (
        <VisitorLayout>
            <Head title="Bayar Zakat Fitrah" />
            <Container className="flex flex-col items-center gap-6">
                <h1 className="typo-h1 text-center">Salurkan Zakat Fitrah Anda</h1>
                <p className="typo-p text-center text-muted-foreground">
                    Desa: {village?.name ?? '-'} <br />
                    Periode: {session.title} | Harga beras default: Rp {session.rice_price.toLocaleString('id-ID')} / kg
                </p>
                <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                    <input
                        className="input"
                        type="number"
                        min="1"
                        placeholder="Jumlah Tanggungan"
                        value={form.dependents}
                        onChange={(e) => setForm({ ...form, dependents: parseInt(e.target.value) })}
                    />
                    <input
                        className="input"
                        type="number"
                        min="1000"
                        step="100"
                        placeholder={`Harga beras per kg (default Rp ${session.rice_price.toLocaleString('id-ID')})`}
                        value={ricePrice}
                        onChange={(e) => setRicePrice(parseInt(e.target.value))}
                    />
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
                    <input className="input" placeholder="No. HP" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
                    <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'bapak' | 'ibu' })}>
                        <option value="bapak">Bapak</option>
                        <option value="ibu">Ibu</option>
                    </select>

                    <p className="text-center font-semibold">Total zakat: Rp {amount.toLocaleString('id-ID')}</p>
                    <button className="btn btn-primary w-full">Bayar Zakat</button>
                </form>
            </Container>
        </VisitorLayout>
    );
};

export default PayZakatFitrah;
