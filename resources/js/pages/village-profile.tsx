import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profil desa',
        href: '/profil-desa',
    },
];

export default function VillageProfile() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil desa" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3">
            </div>
        </AppLayout>
    );
}
