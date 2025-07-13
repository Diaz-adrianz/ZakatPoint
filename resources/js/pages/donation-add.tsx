import Flash from '@/components/flash';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/richtext-editor';
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
        title: 'Sedekah',
        href: '/daftar-sedekah',
    },
    {
        title: 'Tambah program sedekah',
        href: '/',
    },
];

export default function DonationAdd() {
    const { flash } = usePage<SharedData>().props;

    const store = useForm<Required<{ title: string; target: number; description: string }>>({
        title: '',
        description: '',
        target: 0,
    });

    const _store = () => {
        store.post(route('donation.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah program sedekah" />

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
                            <Label>Judul</Label>
                            <Input
                                name="title"
                                placeholder="Judul"
                                value={store.data.title}
                                onChange={(e) => store.setData('title', e.target.value)}
                            />
                            <InputError className="mt-2" message={store.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Target</Label>
                            <Input
                                name="target"
                                type="number"
                                placeholder="Target"
                                value={store.data.target}
                                onChange={(e) => store.setData('target', +e.target.value)}
                            />
                            <small className="!typo-small text-muted-foreground">{formatMoney(store.data.target)}</small>
                            <InputError className="mt-2" message={store.errors.target} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Deskripsi</Label>
                            <RichTextEditor value={store.data.description} onChange={(v) => store.setData('description', v)} />
                            <InputError className="mt-2" message={store.errors.description} />
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
