import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materi belajar',
        href: '/materi-belajar',
    },
];

export default function LearningMaterials() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materi belajar" />
            <div className="flex flex-col gap-3 overflow-x-hidden p-3">
                <div>
                    <Button asChild>
                        <Link href={route('add-learning-material')}>
                            <PlusIcon />
                            Materi baru
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
