import Container from '@/components/container';
import VisitorLayout from '@/layouts/visitor-layout';

const ExploreDonations = () => {
    return (
        <VisitorLayout>
            {/* HERO  */}
            <Container className="flex flex-col items-center gap-3  text-center">
                <h1 className="typo-h1 max-w-3xl">Beri Dampak Sekarang!</h1>
                <p className="typo-p max-w-3xl text-muted-foreground">
                Jelajahi beragam program donasi yang membutuhkan dukungan. Setiap kontribusi Anda memberikan dampak nyata.
                </p>
            </Container>
        </VisitorLayout>
    );
};

export default ExploreDonations;
