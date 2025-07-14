import Flash from '@/components/flash';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatMoney } from '@/lib/utils';
import { SharedData, type BreadcrumbItem } from '@/types';
import {  IncomeZakat, PaginatedResponse } from '@/types/model';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zakat penghasilan',
        href: '/zakat-penghasil',
    },
];

export default function ZakatIncomeList({
    query,
    sumAllAmount,
    zakats,
}: {
    query?: { search?: string };
    sumAllAmount: number;
    zakats: PaginatedResponse<IncomeZakat>;
}) {
    const { flash } = usePage<SharedData>().props;

    const list = useForm<{ search?: string }>({
        search: query?.search,
    });
    const _list = () => {
        list.get(route('zakat-income.list'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zakat penghasilan" />

            <Flash flash={flash} />


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
                            <TableHead>Muzakki</TableHead>
                            <TableHead>Zakat</TableHead>
                            <TableHead>Penghasilan/bulan</TableHead>
                            <TableHead>Penghasilan tambahan</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {zakats.data.map((dat, i) => (
                            <TableRow key={i}>
                                <TableCell className="typo-p">{(zakats.current_page - 1) * zakats.per_page + i + 1}</TableCell>
                                <TableCell>
                                    <p className="!typo-p">{dat.gender} {dat.name}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="!typo-p">{formatMoney(dat.amount)}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="!typo-p">{formatMoney(dat.income_month)}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="!typo-p">{formatMoney(dat.income_plus)}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Button variant={'outline'} size={'icon'}>
                                            <DownloadIcon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex items-center gap-3">
                <small className="!typo-small grow text-muted-foreground">Total {zakats.total} muzakki</small>
                {zakats.prev_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={zakats.prev_page_url}>
                            <ChevronLeftIcon />
                        </Link>
                    </Button>
                )}
                <small className="!typo-p">
                    {zakats.current_page} / {zakats.last_page}
                </small>
                {zakats.next_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={zakats.next_page_url}>
                            <ChevronRightIcon />
                        </Link>
                    </Button>
                )}
            </div>
        </AppLayout>
    );
}
