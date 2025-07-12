import Flash from '@/components/flash';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Article, PaginatedResponse } from '@/types/model';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {  ChevronLeftIcon, ChevronRightIcon, Edit2Icon, EyeIcon, PlusIcon, Trash2Icon, UserRoundXIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Artikel',
        href: '/daftar-artikel',
    },
];

export default function ArticleList({ query, articles }: { query?: { search?: string }; articles: PaginatedResponse<Article> }) {
    const { flash } = usePage<SharedData>().props

    const list = useForm<{ search?: string }>({
        search: query?.search,
    });
    const _list = () => {
        list.get(route('article.list'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }

    const destroy = useForm()
    const _destroy = (id: number) => {
        destroy.delete(route('article.destroy', { id }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Artikel" />

            <Flash flash={flash}/>

            <div>
                <Button asChild>
                    <Link href={route('article.add')}>
                        <PlusIcon />
                        Artikel baru
                    </Link>
                </Button>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    _list()
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
                            <TableHead className='w-8'></TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.data.map((dat, i) => (
                            <TableRow key={i}>
                                <TableCell className="typo-p">{(articles.current_page - 1) * articles.per_page + i + 1}</TableCell>
                                <TableCell>
                                    <p className="!typo-p">{dat.title}</p>
                                    <small className="!typo-small text-muted-foreground">{dat.slug}</small>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Button variant={'outline'} size={'icon'} asChild>
                                            <Link href={`/artikel/${dat.slug}`} target='_blank' prefetch>
                                                <EyeIcon />
                                            </Link>
                                        </Button>
                                        <Button variant={'outline'} size={'icon'} asChild>
                                            <Link href={`/daftar-artikel/edit/${dat.id}`} target='_blank' prefetch>
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
                <small className="!typo-small grow text-muted-foreground">Total {articles.total} artikel</small>
                {articles.prev_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={articles.prev_page_url}>
                            <ChevronLeftIcon />
                        </Link>
                    </Button>
                )}
                <small className="!typo-p">
                    {articles.current_page} / {articles.last_page}
                </small>
                {articles.next_page_url && (
                    <Button variant={'outline'} size={'icon'} asChild>
                        <Link href={articles.next_page_url}>
                            <ChevronRightIcon />
                        </Link>
                    </Button>
                )}
            </div>
        </AppLayout>
    );
}
