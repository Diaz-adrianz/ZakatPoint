import Flash from '@/components/flash';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { PaginatedResponse, UserVillage } from '@/types/model';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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

export default function Resident({ query, villagers }: { query?: {search?: string}, villagers: PaginatedResponse<UserVillage> }) {
    const { flash } = usePage<SharedData>().props 

    const list = useForm<Query>({
        search: query?.search
    });

    const acceptUser = useForm<{user_village_id?: number}>({})
    const _acceptUser = (id: number) => {
        acceptUser.data.user_village_id = id
        acceptUser.patch(route("accept-user"), {
            preserveState: true,   
            preserveScroll: true,  
            replace: true 
        })

    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penduduk" />

            <Flash flash={flash}/>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    list.get(route('resident'), {
                        preserveState: true,   
                        preserveScroll: true,  
                        replace: true 
                    });
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
                                    <div className="flex gap-3 items-center">
                                        {v.is_pending ? (
                                            <Button variant={'outline'} size={'icon'} onClick={() => _acceptUser(v.id)}>
                                                <CheckIcon />
                                            </Button>
                                        ) : (
                                            ''
                                        )}
                                        <Button variant={'destructive'} size={'icon'}>
                                            <UserRoundXIcon />
                                        </Button>
                                    </div>
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
