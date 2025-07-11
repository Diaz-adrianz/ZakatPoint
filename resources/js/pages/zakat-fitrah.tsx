import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat fitrah',
        href: '/zakat-fitrah',
    },
];

export default function ZakatFitrah() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zakat fitrah" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3">
                <div>
                <Button asChild>
                    <Link href={route("add-zakat-fitrah-periode")}>
                    <PlusIcon />
                    Periode baru
                    </Link>
                </Button>
                </div>
            </div>
        </AppLayout>
    );
}
