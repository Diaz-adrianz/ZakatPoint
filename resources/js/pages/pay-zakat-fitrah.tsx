import Container from '@/components/container';
import VisitorLayout from '@/layouts/visitor-layout';

const PayZakatFitrah = () => {
    return (
        <VisitorLayout>
            {/* HERO  */}
            <Container className="flex flex-col items-center gap-3 text-center">
                <h1 className="typo-h1 max-w-3xl">Salurkan Zakat Fitrah Anda</h1>
                <p className="typo-p max-w-3xl text-muted-foreground">
                    Tunaikan zakat Anda dengan praktis di sini. Proses cepat, aman, dan langsung tersalurkan.
                </p>
            </Container>
        </VisitorLayout>
    );
};

export default PayZakatFitrah;
