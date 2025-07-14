import Flash from '@/components/flash';
import InputError from '@/components/input-error';
import RichTextEditor from '@/components/richtext-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Article } from '@/types/model';
import { Head, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Artikel',
        href: '/daftar-artikel',
    },
    {
        title: 'Edit artikel',
        href: '/',
    },
];

export default function ArticleEdit({ article }: { article: Article }) {
    const { flash } = usePage<SharedData>().props;

    const update = useForm<Required<{ title: string; content: string }>>({
        title: article.title,
        content: article.content,
    });

    const _update = () => {
        update.post(route('article.update', { id: article.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit artikel" />

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
                            <Label>Konten</Label>
                            <RichTextEditor value={update.data.content} onChange={(v) => update.setData('content', v)} />
                            <InputError className="mt-2" message={update.errors.content} />
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
