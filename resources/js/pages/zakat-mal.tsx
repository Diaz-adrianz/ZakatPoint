import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat mal',
        href: '/zakat-mal',
    },
];

export default function ZakatMal() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zakat mal" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3"></div>
        </AppLayout>
    );
}
