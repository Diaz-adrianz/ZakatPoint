import Flash from '@/components/flash';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatMoney } from '@/lib/utils';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat fitrah',
        href: '/zakat-fitrah',
    },
    {
        title: 'Tambah periode zakat fitrah',
        href: '/',
    },
];

export default function ZakatFitrahPeriodeAdd() {
    const { flash } = usePage<SharedData>().props;

    const store = useForm<Required<{ title: string; start_date: string; end_date: string, rice_price: number }>>({
        title: '',
        start_date: '',
        end_date: '',
        rice_price: 0,
    });

    const _store = () => {
        store.post(route('zakat-fitrah-periode.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah periode zakat fitrah" />

            <Flash flash={flash} />

            <Card>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            _store();
                        }}
                        className="flex flex-col gap-6"
                    >
                        <div className="grid gap-2">
                            <Label>Nama periode</Label>
                            <Input
                                name="title"
                                placeholder="Judul"
                                value={store.data.title}
                                onChange={(e) => store.setData('title', e.target.value)}
                            />
                            <InputError className="mt-2" message={store.errors.title} />
                        </div>

                        <div className="flex gap-2">
                            <div className="grid gap-2">
                                <Label>Tanggal buka</Label>
                                <Input
                                    name="start_date"
                                    type="date"
                                    value={store.data.start_date}
                                    onChange={(e) => store.setData('start_date', e.target.value)}
                                />
                                <InputError className="mt-2" message={store.errors.start_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tanggal tutup</Label>
                                <Input
                                    name="end_date"
                                    type="date"
                                    value={store.data.end_date}
                                    onChange={(e) => store.setData('end_date', e.target.value)}
                                />
                                <InputError className="mt-2" message={store.errors.end_date} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Harga beras 1 sha' di desa</Label>
                            <Input
                                name="rice_price"
                                type="number"
                                value={store.data.rice_price}
                                onChange={(e) => store.setData('rice_price', +e.target.value)}
                            />
                            <small className="!typo-small text-muted-foreground">{formatMoney(store.data.rice_price)}</small>
                            <InputError className="mt-2" message={store.errors.rice_price} />
                        </div>


                        <div>
                            <Button disabled={store.processing}>Simpan</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
