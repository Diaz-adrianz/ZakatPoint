import Flash from '@/components/flash';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatMoney } from '@/lib/utils';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Donation, PaginatedResponse } from '@/types/model';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, Edit2Icon, EyeIcon, PlusIcon, Trash2Icon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sedekah',
        href: '/daftar-sedekah',
    },
];

export default function DonationList({
    query,
    sumAllNominal,
    donations,
}: {
    query?: { search?: string };
    sumAllNominal: number;
    donations: PaginatedResponse<Donation>;
}) {
    const { flash } = usePage<SharedData>().props;

    const list = useForm<{ search?: string }>({
        search: query?.search,
    });
    const _list = () => {
        list.get(route('donation.list'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const destroy = useForm();
    const _destroy = (id: number) => {
        destroy.delete(route('donation.destroy', { id }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sedekah" />

            <Flash flash={flash} />

            <div>
                <Button asChild>
                    <Link href={route('donation.add')}>
                        <PlusIcon />
                        Program sedekah baru
                    </Link>
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <Card className="min-w-80">
                    <CardHeader>
                        <CardDescription>Total terkumpul</CardDescription>
                        <CardTitle className="typo-h3">{formatMoney(sumAllNominal, { shorten: true })}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Separator />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    _list();
                }}
                className="flex flex-wrap gap-3"
            >
                <div>
                    <Input name="search" placeholder="Cari..." value={list.data.search} onChange={(e) => list.setData('search', e.target.value)} />
                </div>
            </form>

            <Card className="overflow-x-auto py-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8"></TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Terkumpul</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {donations.data.map((dat, i) => (
                            <TableRow key={i}>
                                <TableCell className="typo-p">{(donations.current_page - 1) * donations.per_page + i + 1}</TableCell>
                                <TableCell>
                                    <p className="!typo-p">{dat.title}</p>
                                    <small className="!typo-small text-muted-foreground">{dat.slug}</small>
                                </TableCell>
                                <TableCell>
                                    <p className="!typo-p">{formatMoney(dat.donaturs_sum_nominal)}</p>
                                    <small className="!typo-small text-muted-foreground">Target: {formatMoney(dat.target ?? 0)}</small>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Button variant={'outline'} size={'icon'} asChild>
                                            <Link href={route('article.view', { slug: dat.slug })} target="_blank">
                                                <EyeIcon />
                                            </Link>
                                        </Button>
                                        <Button variant={'outline'} size={'icon'} asChild>
                                            <Link href={route('article.edit', { id: dat.id })}>
                                                <Edit2Icon />
                                            </Link>
                                        </Button>
                                        <Button variant={'destructive'} size={'icon'} onClick={() => _destroy(dat.id)}>
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex items-center gap-3">
                <small className="!typo-small grow text-muted-foreground">Total {donations.total} program sedekah</small>
                {donations.prev_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={donations.prev_page_url}>
                            <ChevronLeftIcon />
                        </Link>
                    </Button>
                )}
                <small className="!typo-p">
                    {donations.current_page} / {donations.last_page}
                </small>
                {donations.next_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={donations.next_page_url}>
                            <ChevronRightIcon />
                        </Link>
                    </Button>
                )}
            </div>
        </AppLayout>
    );
}
