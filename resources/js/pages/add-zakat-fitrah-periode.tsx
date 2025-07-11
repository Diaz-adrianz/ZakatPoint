import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat fitrah',
        href: '/zakat-fitrah',
    },
    {
        title: 'Tambah periode',
        href: '/zakat-fitrah-tambah-periode',
    },
];

export default function ZakatFitrahAddPeriode() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah periode" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3"></div>
        </AppLayout>
    );
}
