import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedResponse, UserVillage } from '@/types/model';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, UserRoundXIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penduduk',
        href: '/penduduk',
    },
];

type Query = {
    search?: string;
    is_pending?: boolean;
};

export default function Resident({ villagers }: { villagers: PaginatedResponse<UserVillage> }) {
    const { data, setData, get } = useForm<Query>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penduduk" />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    get(route('resident'));
                }}
                className="mb-3 flex flex-wrap gap-3"
            >
                <div>
                    <Input name="search" placeholder="Cari..." value={data.search} onChange={(e) => setData('search', e.target.value)} />
                </div>
            </form>

            <Card className="mb-3 overflow-x-auto py-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead className="w-[100px]">Nama</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {villagers.data.map((v, i) => (
                            <TableRow key={i}>
                                <TableCell className="typo-p">{(villagers.current_page - 1) * villagers.per_page + i + 1}</TableCell>
                                <TableCell className="typo-p">{v.user?.name}</TableCell>
                                <TableCell className="typo-p">
                                    {v.is_pending ? <Badge variant={'destructive'}>Tertunda</Badge> : <Badge>Sah</Badge>}
                                </TableCell>
                                <TableCell>
                                    <Select value={v.role}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Peran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="member">Warga</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {v.is_pending ? (
                                        <Button variant={'outline'} size={'icon'}>
                                            <CheckIcon />
                                        </Button>
                                    ) : (
                                        ''
                                    )}
                                    <Button variant={'destructive'} size={'icon'}>
                                        <UserRoundXIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex items-center gap-3">
                <small className="!typo-small grow text-muted-foreground">Total {villagers.total} penduduk</small>
                {villagers.prev_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={villagers.prev_page_url}>
                            <ChevronLeftIcon />
                        </Link>
                    </Button>
                )}
                <small className="!typo-p">
                    {villagers.current_page} / {villagers.last_page}
                </small>
                {villagers.next_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={villagers.next_page_url}>
                            <ChevronRightIcon />
                        </Link>
                    </Button>
                )}
            </div>
        </AppLayout>
    );
}
