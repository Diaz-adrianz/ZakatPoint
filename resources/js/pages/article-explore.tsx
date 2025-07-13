import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import VisitorLayout from '@/layouts/visitor-layout';
import { Article, PaginatedResponse } from '@/types/model';
import { Link, useForm } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const ArticleExplore = ({ query, articles }: { query?: { search?: string }; articles: PaginatedResponse<Article> }) => {    
    const list = useForm<{ search?: string }>({
        search: query?.search,
    });
    const _list = () => {
        list.get(route('article.explore'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }
    
    return (
        <VisitorLayout>
            {/* HERO  */}
            <Container className="flex flex-col items-center gap-3 text-center">
                <h1 className="typo-h1 max-w-3xl">Pusat Belajar Zakat</h1>
                <p className="typo-p max-w-3xl text-muted-foreground mb-12">
                    Pahami seluk-beluk zakat secara mendalam. Artikel dan panduan lengkap untuk menunaikan zakat dengan benar.{' '}
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        _list()
                    }}
                    className="flex w-full flex-wrap gap-3"
                >
                    <div className='grow'>
                        <Input className='rounded-full' name="search" placeholder="Cari..." value={list.data.search} onChange={(e) => list.setData('search', e.target.value)} />
                    </div>
                </form>


                <div className="flex w-full text-start flex-col gap-3">
                    {
                        articles.data.map((dat, i) => 
                            <Card key={i}>
                                <CardHeader>
                                    <CardTitle>
                                        <Link href={route('article.view', {slug: dat.slug})} className="typo-h4 text-primary line-clamp-1 ">
                                            {dat.title}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription>Desa {dat.village?.village}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dat.content}
                                </CardContent>
                            </Card>
                        )
                    }
                </div>

                <div className="flex flex-wrap gap-3">
                    {
                        articles.links.map((l, i) => 
                            <Button key={i} variant={l.label == articles.current_page.toString() ? 'secondary': 'outline'} size={'sm'} asChild>
                                <Link href={l.url ?? '#'}>
                                    {l.label.includes("Previous") ? <ChevronLeftIcon /> : l.label.includes("Next") ?  <ChevronRightIcon />:  l.label}
                                </Link>
                            </Button>
                        )
                    }
                </div>
            </Container>
        </VisitorLayout>
    );
};

export default ArticleExplore;
