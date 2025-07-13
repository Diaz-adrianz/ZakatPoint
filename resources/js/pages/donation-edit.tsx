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
import { Donation } from '@/types/model';
import { Head, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sedekah',
        href: '/daftar-sedekah',
    },
    {
        title: 'Edit program sedekah',
        href: '/',
    },
];

export default function DonationEdit({ donation }: { donation: Donation }) {
    const { flash } = usePage<SharedData>().props;

    const update = useForm<Required<{ title: string; target: number; description: string }>>({
        title: donation.title,
        target: donation.target ?? 0,
        description: donation.description,
    });

    const _update = () => {
        update.post(route('donation.update', { id: donation.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit program sedekah" />

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
                            <Label>Judul</Label>
                            <Input
                                name="title"
                                placeholder="Judul"
                                value={update.data.title}
                                onChange={(e) => update.setData('title', e.target.value)}
                            />
                            <InputError className="mt-2" message={update.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Target</Label>
                            <Input
                                name="target"
                                type="number"
                                placeholder="Target"
                                value={update.data.target}
                                onChange={(e) => update.setData('target', +e.target.value)}
                            />
                            <small className="!typo-small text-muted-foreground">{formatMoney(update.data.target)}</small>
                            <InputError className="mt-2" message={update.errors.target} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Deskripsi </Label>
                            <RichTextEditor value={update.data.description} onChange={(v) => update.setData('description', v)} />
                            <InputError className="mt-2" message={update.errors.description} />
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
