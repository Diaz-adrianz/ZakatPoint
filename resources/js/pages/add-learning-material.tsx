import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materi belajar',
        href: '/materi-belajar',
    },
    {
        title: 'Tambah materi',
        href: '/',
    },
];

export default function AddLearningMaterial() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah materi belajar" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3"></div>
        </AppLayout>
    );
}
