import Container from '@/components/container';
import InputError from '@/components/input-error';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, sid]);

    if (!draft) {
        return <Container className="max-w-md">Loading...</Container>;
    }

    const labelMap: Record<string, JSX.Element> = {
        fitrah: (
            <>
                <div className="flex items-center justify-between">
                    <p>Tanggungan:</p> 
                    <strong>{draft.dependents}</strong>
                </div>
                <div className="flex items-center justify-between">
                    <p>Total Zakat: </p> 
                    <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
                </div> 
            </>
        ),
        gold: (
            <>
                <div className="flex items-center justify-between">
                    <p>Berat emas:</p> 
                    <strong>{draft.weight} gram</strong>
                </div>
                <div className="flex items-center justify-between">
                    <p>Total Zakat: </p> 
                    <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
                </div> 
            </>
        ),
        silver: (
            <>
                <div className="flex items-center justify-between">
                    <p>Berat perak:</p> 
                    <strong>{draft.weight} gram</strong>
                </div>
                <div className="flex items-center justify-between">
                    <p>Total Zakat: </p> 
                    <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
                </div> 
            </>
        ),
        income: (
            <>
                <div className="flex items-center justify-between">
                    <p>Penghasilan Bulanan:</p> 
                    <strong>Rp {draft.income_month?.toLocaleString?.('id-ID') ?? '-'}</strong>
                </div>
                <div className="flex items-center justify-between">
                    <p>Bonus / THR:</p> 
                    <strong>Rp {draft.income_plus?.toLocaleString?.('id-ID') ?? '-'}</strong>
                </div> 
                <div className="flex items-center justify-between">
                    <p>Total Zakat:</p> 
                    <strong>Rp {draft.amount?.toLocaleString?.('id-ID') ?? '-'}</strong>
                </div>             
            </>
        ),
    };

    return (
        <div className="space-y-6">
            <div className="w-full flex flex-col gap-3 border rounded-md p-6">
                {labelMap[type]}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post(route(routeMap[type]));
                }}
                className="flex flex-col gap-6 rounded-md border border-primary/40 bg-primary/5 p-6 text-primary"
            >
                {/* Nama */}
                <div className="grid gap-2">
                    <Label>Nama Lengkap</Label>
                    <Input name='name' value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" name='email' value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* No HP */}
                <div className="grid gap-2">
                    <Label>No HP</Label>
                    <Input name='no_hp' value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} />
                    <InputError className="mt-2" message={errors.no_hp} />
                </div>

                {/* Gender */}
                <div className="grid gap-2">
                    <Label>Panggilan</Label>
                    <Select name='gender' value={data.gender} onValueChange={(v) => setData('gender', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Bapak">Bapak</SelectItem>
                            <SelectItem value="Ibu">Ibu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button className="mt-6 w-full" size={'lg'} disabled={processing}>
                    <ShieldCheckIcon /> Bayar
                </Button>
            </form>
        </div>
    );
}
