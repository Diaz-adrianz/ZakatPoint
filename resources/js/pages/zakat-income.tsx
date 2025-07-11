import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat penghasilan',
        href: '/zakat-penghasilan',
    },
];

export default function ZakatIncome() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zakat penghasilan" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3"></div>
        </AppLayout>
    );
}
