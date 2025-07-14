import Flash from '@/components/flash';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatMoney } from '@/lib/utils';
import { SharedData, type BreadcrumbItem } from '@/types';
import { FitrahZakatPeriode, PaginatedResponse } from '@/types/model';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, Edit2Icon, PlusIcon, Trash2Icon } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat fitrah',
        href: '/zakat-fitrah',
    },
];

export default function ZakatFitrahPeriodeList({
    query,
    sumAllAmount,
    periodes,
}: {
    query?: { search?: string };
    sumAllAmount: number;
    periodes: PaginatedResponse<FitrahZakatPeriode>;
}) {
    const { flash } = usePage<SharedData>().props;

    const list = useForm<{ search?: string }>({
        search: query?.search,
    });
    const _list = () => {
        list.get(route('zakat-fitrah-periode.list'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const destroy = useForm();
    const _destroy = (id: number) => {
        destroy.delete(route('zakat-fitrah-periode.destroy', { id }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zakat fitrah" />

            <Flash flash={flash} />

            <div>
                <Button asChild>
                    <Link href={route('zakat-fitrah-periode.add')}>
                        <PlusIcon />
                        Periode baru
                    </Link>
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <Card className="min-w-80">
                    <CardHeader>
                        <CardDescription>Total terkumpul</CardDescription>
                        <CardTitle className="typo-h3">{formatMoney(sumAllAmount, { shorten: true })}</CardTitle>
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
                            <TableHead>Periode</TableHead>
                            <TableHead>Kode</TableHead>
                            <TableHead>Terkumpul</TableHead>
                            <TableHead>Harga beras (1 sha')</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {periodes.data.map((dat, i) => (
                            <TableRow key={i}>
                                <TableCell className="typo-p">{(periodes.current_page - 1) * periodes.per_page + i + 1}</TableCell>
                                <TableCell>
                                    <p className="!typo-p">{dat.title}</p>
                                    <small className="!typo-small text-muted-foreground">
                                        {moment(dat.start_date).format('DD MMM YYYY')} s/d {moment(dat.end_date).format('DD MMM YYYY')}
                                    </small>
                                </TableCell>
                                <TableCell>
                                    <p className="!typo-p">{dat.code}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="!typo-p">{formatMoney(dat.zakats_sum_amount)}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="!typo-p">{formatMoney(dat.rice_price)}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Button variant={'outline'} size={'icon'} asChild>
                                            <Link href={route('zakat-fitrah-periode.edit', { id: dat.id })}>
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
                <small className="!typo-small grow text-muted-foreground">Total {periodes.total} periode</small>
                {periodes.prev_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={periodes.prev_page_url}>
                            <ChevronLeftIcon />
                        </Link>
                    </Button>
                )}
                <small className="!typo-p">
                    {periodes.current_page} / {periodes.last_page}
                </small>
                {periodes.next_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={periodes.next_page_url}>
                            <ChevronRightIcon />
                        </Link>
                    </Button>
                )}
            </div>
        </AppLayout>
    );
}
