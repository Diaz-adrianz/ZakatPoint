import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { ShieldCheckIcon } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';

interface Props {
    type: 'fitrah' | 'gold' | 'income' | 'silver';
    sid: string;
}

export default function ZakatView({ type, sid }: Props) {
    const [draft, setDraft] = useState<any>(null);

    const { data, setData, post, processing, errors } = useForm({
        sid,
        name: '',
        email: '',
        no_hp: '',
        gender: 'Bapak',
        village_id: 0,
    });

    const routeMap = {
        fitrah: 'fitrah.pay',
        gold: 'gold.pay',
        income: 'income.pay',
        silver: 'silver.pay',
    };

    useEffect(() => {
        axios.get(`/api/zakat/${type}/draft/${sid}`).then((res) => {
            setDraft(res.data);
            if (res.data.village_id) {
                setData('village_id', res.data.village_id);
            }
        });
    }, [type, sid]);

    if (!draft) {
        return <Container className="max-w-md">Loading...</Container>;
    }

    const labelMap: Record<string, JSX.Element> = {
        fitrah: (
            <p className="text-center">
                Tanggungan: <strong>{draft.dependents}</strong>
                <br />
                Total Zakat: <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
            </p>
        ),
        gold: (
            <p className="text-center">
                Berat emas: <strong>{draft.weight}</strong> gram
                <br />
                Total Zakat: <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
            </p>
        ),
        silver: (
            <p className="text-center">
                Berat perak: <strong>{draft.weight}</strong> gram
                <br />
                Total Zakat: <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
            </p>
        ),
        income: (
            <p className="text-center">
                Penghasilan Bulanan: <strong>Rp {draft.income_month?.toLocaleString?.('id-ID') ?? '-'}</strong>
                <br />
                Bonus / THR: <strong>Rp {draft.income_plus?.toLocaleString?.('id-ID') ?? '-'}</strong>
                <br />
                Total Zakat: <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
            </p>
        ),
    };

    return (
        <div className="space-y-6">
            {labelMap[type]}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post(route(routeMap[type]));
                }}
            >
                {/* Nama */}
                <Label>Nama Lengkap</Label>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <small className="text-red-500">{errors.name}</small>}

                {/* Email */}
                <Label className="mt-4">Email</Label>
                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                {errors.email && <small className="text-red-500">{errors.email}</small>}

                {/* No HP */}
                <Label className="mt-4">No HP</Label>
                <Input value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} />
                {errors.no_hp && <small className="text-red-500">{errors.no_hp}</small>}

                {/* Gender */}
                <Label className="mt-4">Panggilan</Label>
                <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Bapak">Bapak</SelectItem>
                        <SelectItem value="Ibu">Ibu</SelectItem>
                    </SelectContent>
                </Select>

                <Button className="mt-6 w-full" disabled={processing}>
                    <ShieldCheckIcon /> Bayar
                </Button>
            </form>
        </div>
    );
}
