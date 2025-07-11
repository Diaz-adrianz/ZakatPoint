import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat fitrah',
        href: '/zakat-fitrah',
    },
    {
        title: 'Edit periode',
        href: '/zakat-fitrah-edit-periode',
    },
];

export default function ZakatFitrahEditPeriode() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit periode" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3">
            </div>
        </AppLayout>
    );
}
