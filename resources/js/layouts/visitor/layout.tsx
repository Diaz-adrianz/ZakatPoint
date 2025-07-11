import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {}

export default function VisitorLayout({ children }: PropsWithChildren<AuthLayoutProps>) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <div className="sticky-top top-0 border-b">
                <Container className="flex flex-wrap items-center gap-3 py-3">
                    <h1 className="grow text-2xl font-bold">ZakatPoint</h1>
                    <div className="flex items-center overflow-x-auto">
                        <Button variant={'ghost'} asChild>
                            <Link href="/belajar">Belajar</Link>
                        </Button>
                        <Button variant={'ghost'} asChild>
                            <Link href="/donasi">Donasi</Link>
                        </Button>
                        {auth.user && (
                            <Button variant={'ghost'} asChild>
                                <Link href={route('dashboard')}>Dasbor desa</Link>
                            </Button>
                        )}
                    </div>
                </Container>
            </div>
            {children}
        </>
    );
}
