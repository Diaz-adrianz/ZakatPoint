import Flash from '@/components/flash';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatMoney } from '@/lib/utils';
import { SharedData, type BreadcrumbItem } from '@/types';
import { FitrahZakatPeriode } from '@/types/model';
import { Head, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat fitrah',
        href: '/zakat-fitrah',
    },
    {
        title: 'Edit periode zakat fitrah',
        href: '/',
    },
];

export default function ZakatFitrahPeriodeEdit({ periode }: { periode: FitrahZakatPeriode }) {
    const { flash } = usePage<SharedData>().props;

    const update = useForm<Required<{ title: string; start_date: string; end_date: string, rice_price: number }>>({
        title: periode.title,
        start_date: periode.start_date,
        end_date: periode.end_date,
        rice_price: periode.rice_price,
    });

    const _update = () => {
        update.post(route('zakat-fitrah-periode.update', { id: periode.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit periode zakat fitrah" />

            <Flash flash={flash} />

            <Card>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            _update();
                        }}
                        className="flex flex-col gap-6"
                    >
                        <div className="grid gap-2">
                            <Label>Nama periode</Label>
                            <Input
                                name="title"
                                placeholder="Judul"
                                value={update.data.title}
                                onChange={(e) => update.setData('title', e.target.value)}
                            />
                            <InputError className="mt-2" message={update.errors.title} />
                        </div>

                        <div className="flex gap-2">
                            <div className="grid gap-2">
                                <Label>Tanggal buka</Label>
                                <Input
                                    name="start_date"
                                    type="date"
                                    value={update.data.start_date}
                                    onChange={(e) => update.setData('start_date', e.target.value)}
                                />
                                <InputError className="mt-2" message={update.errors.start_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tanggal tutup</Label>
                                <Input
                                    name="end_date"
                                    type="date"
                                    value={update.data.end_date}
                                    onChange={(e) => update.setData('end_date', e.target.value)}
                                />
                                <InputError className="mt-2" message={update.errors.end_date} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Harga beras 1 sha' di desa</Label>
                            <Input
                                name="rice_price"
                                type="number"
                                value={update.data.rice_price}
                                onChange={(e) => update.setData('rice_price', +e.target.value)}
                            />
                            <small className="!typo-small text-muted-foreground">{formatMoney(update.data.rice_price)}</small>
                            <InputError className="mt-2" message={update.errors.rice_price} />
                        </div>


                        <div>
                            <Button disabled={update.processing}>Simpan</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
