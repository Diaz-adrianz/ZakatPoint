import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {}

export default function VisitorLayout({ children }: PropsWithChildren<AuthLayoutProps>) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();

    return (
        <>
            <div className="sticky-top top-0 border-b">
                <Container className="flex flex-wrap items-center gap-3 py-3">
                    <h1 className="grow text-2xl font-bold">ZakatPoint</h1>
                    <div className="flex items-center gap-3 overflow-x-auto">
                        <Button variant={page.url == '/artikel' ? 'secondary' : 'ghost'} asChild>
                            <Link href={route('article.explore')}>Artikel</Link>
                        </Button>
                        <Button variant={page.url == '/sedekah' ? 'secondary' : 'ghost'} asChild>
                            <Link href={route('explore-donations')}>Sedekah</Link>
                        </Button>
                        {auth.user ? (
                            <Button variant={'outline'} asChild>
                                <Link href={route('dashboard')}>Dasbor</Link>
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href={route('login')}>Login</Link>
                            </Button>
                        )}
                    </div>
                </Container>
            </div>
            {children}
        </>
    );
}
