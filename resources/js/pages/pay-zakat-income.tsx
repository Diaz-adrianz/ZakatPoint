import { useState } from 'react';

interface Props {
    village: { id: number; name: string } | null;
    csrf: string;
}

export default function PayZakatPenghasilan({ village, csrf }: Props) {
    const [form, setForm] = useState({
        income_month: '',
        income_plus: '',
        email: '',
        name: '',
        no_hp: '',
        gender: 'bapak',
    });
    const [result, setResult] = useState<any | null>(null);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/income-zakat/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
            body: JSON.stringify({
                income_month: parseFloat(form.income_month || '0'),
                income_plus: parseFloat(form.income_plus || '0'),
            }),
        });
        const data = await res.json();
        setResult(data);
    };

    const handlePay = async () => {
        if (!village || !result?.is_nisab) return;
        const res = await fetch('/income-zakat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
            body: JSON.stringify({
                ...form,
                income_month: parseFloat(form.income_month || '0'),
                income_plus: parseFloat(form.income_plus || '0'),
                village_id: village.id,
                payment_id: 1,
                amount: result.amount,
            }),
        });
        const data = await res.json();
        if (data.success) {
            alert(`Zakat berhasil dicatat, ID: ${data.zakat_id}`);
            setForm({ income_month: '', income_plus: '', email: '', name: '', no_hp: '', gender: 'bapak' });
            setResult(null);
        }
    };

    return (
        <form onSubmit={handleCalculate} className="space-y-3">
            <input
                className="input"
                placeholder="Penghasilan bulanan (Rp)"
                type="number"
                value={form.income_month}
                onChange={(e) => setForm({ ...form, income_month: e.target.value })}
            />
            <input
                className="input"
                placeholder="Bonus / THR (Rp)"
                type="number"
                value={form.income_plus}
                onChange={(e) => setForm({ ...form, income_plus: e.target.value })}
            />
            <button className="btn btn-primary" type="submit" disabled={!village}>
                Hitung Zakat
            </button>

            {result && (
                <div className="mt-4 text-center">
                    <p className={result.is_nisab ? 'text-green-600' : 'text-red-600'}>{result.message}</p>

                    {result.is_nisab && (
                        <>
                            <p className="text-lg">Zakat yang harus dibayar:</p>
                            <p className="text-2xl font-bold">Rp {result.amount.toLocaleString('id-ID')}</p>

                            {/* Form data personal muncul setelah nisab tercapai */}
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
                                <button onClick={handlePay} className="btn btn-success mt-2 w-full">
                                    Bayar Zakat
                                </button>
                            </div>
                        </>
                    )}

                    {!result.is_nisab && (
                        <p className="text-sm text-gray-600">Nilai belum mencapai nisab Rp {result.nisab_value.toLocaleString('id-ID')}</p>
                    )}
                </div>
            )}
        </form>
    );
}
