import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import VisitorLayout from '@/layouts/visitor-layout';
import { formatMoney } from '@/lib/utils';
import { Donation, PaginatedResponse } from '@/types/model';
import { Link, useForm } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const DonationExplore = ({ query, donations }: { query?: { search?: string }; donations: PaginatedResponse<Donation> }) => {
    const list = useForm<{ search?: string }>({
        search: query?.search,
    });
    const _list = () => {
        list.get(route('donation.explore'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <VisitorLayout>
            {/* HERO  */}
            <Container className="flex flex-col items-center gap-3 text-center">
                <h1 className="typo-h1 max-w-3xl">Beri Dampak Sekarang!</h1>
                <p className="typo-p mb-12 max-w-3xl text-muted-foreground">
                    Jelajahi beragam program sedekah yang membutuhkan dukungan. Setiap kontribusi Anda memberikan dampak nyata.
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        _list();
                    }}
                    className="flex w-full flex-wrap gap-3"
                >
                    <div className="grow">
                        <Input
                            className="rounded-full"
                            name="search"
                            placeholder="Cari..."
                            value={list.data.search}
                            onChange={(e) => list.setData('search', e.target.value)}
                        />
                    </div>
                </form>

                <div className="flex w-full flex-col gap-3 text-start">
                    {donations.data.map((dat, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle>
                                    <Link href={route('donation.view', { slug: dat.slug })} className="typo-h4 line-clamp-1 text-primary">
                                        {dat.title}
                                    </Link>
                                </CardTitle>
                                <CardDescription>Desa {dat.village?.village}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dat.target && dat.target > 0 ? (
                                    <div className="mb-3 flex max-w-md items-center gap-3">
                                        <Progress value={Math.min(100, ((dat.donaturs_sum_nominal ?? 0) / dat.target) * 100)} />
                                        <small className="!typo-small whitespace-nowrap text-muted-foreground">
                                            {formatMoney(dat.donaturs_sum_nominal)}
                                        </small>
                                    </div>
                                ) : null}
                                {dat.description}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3">
                    {donations.links.map((l, i) => (
                        <Button key={i} variant={l.label == donations.current_page.toString() ? 'secondary' : 'outline'} size={'sm'} asChild>
                            <Link href={l.url ?? '#'}>
                                {l.label.includes('Previous') ? <ChevronLeftIcon /> : l.label.includes('Next') ? <ChevronRightIcon /> : l.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </Container>
        </VisitorLayout>
    );
};

export default DonationExplore;
