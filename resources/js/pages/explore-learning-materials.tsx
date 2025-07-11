import Container from '@/components/container';
import VisitorLayout from '@/layouts/visitor-layout';

const ExploreLearningMaterials = () => {
    return (
        <VisitorLayout>
            {/* HERO  */}
            <Container className="flex flex-col items-center gap-3 text-center">
                <h1 className="typo-h1 max-w-3xl">Pusat Belajar Zakat</h1>
                <p className="typo-p max-w-3xl text-muted-foreground">
                Pahami seluk-beluk zakat secara mendalam. Artikel dan panduan lengkap untuk menunaikan zakat dengan benar.                </p>
            </Container>
        </VisitorLayout>
    );
};

export default ExploreLearningMaterials;
