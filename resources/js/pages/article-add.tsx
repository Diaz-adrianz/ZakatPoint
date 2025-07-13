import Flash from '@/components/flash';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/richtext-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Artikel',
        href: '/daftar-artikel',
    },
    {
        title: 'Tambah artikel',
        href: '/',
    },
];

export default function ArticleAdd() {
    const { flash } = usePage<SharedData>().props;

    const store = useForm<Required<{ title: string; content: string }>>({
        title: '',
        content: '',
    });

    const _store = () => {
        store.post(route('article.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah artikel" />

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
                            <Label>Konten</Label>
                            <RichTextEditor value={store.data.content} onChange={(v) => store.setData('content', v)} />
                            <InputError className="mt-2" message={store.errors.content} />
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
