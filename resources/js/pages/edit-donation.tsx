import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Donasi',
        href: '/donasi',
    },
    {
        title: 'Edit donasi',
        href: '/',
    },
];

export default function EditDonation() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit donasi" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3"></div>
        </AppLayout>
    );
}
