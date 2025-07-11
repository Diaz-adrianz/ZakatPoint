import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penduduk',
        href: '/penduduk',
    },
];

export default function Resident() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penduduk" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3">
            </div>
        </AppLayout>
    );
}
