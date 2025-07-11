import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import VisitorLayout from '@/layouts/visitor-layout';
import { Link } from '@inertiajs/react';

const Home = () => {
    return (
        <VisitorLayout>
            {/* HERO  */}
            <Container className="flex flex-col items-center gap-3 py-24 text-center">
                <h1 className="typo-h1 max-w-3xl">Solusi Digital Pengelolaan Zakat untuk Semua Desa di Indonesia</h1>
                <p className="typo-p max-w-3xl text-muted-foreground">
                    Nikmati kemudahan berzakat dan berdonasi secara digital. Dapatkan edukasi zakat, dan optimalkan potensi zakat untuk kemajuan
                    komunitas lokal.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="bayar-zakat">Bayar zakat</Link>
                    </Button>
                    <Button variant={'outline'} asChild>
                        <Link href={route('village-dashboard')}>Daftarkan desa</Link>
                    </Button>
                </div>
            </Container>
        </VisitorLayout>
    );
};

export default Home;
