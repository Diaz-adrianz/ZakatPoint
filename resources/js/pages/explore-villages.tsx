import Container from '@/components/container';
import { Head } from '@inertiajs/react';

export default function ExploreVillages() {
    return (
        <>
            <Head title="Cari desa" />
            <Container className="flex flex-col gap-3">
                <h3 className="typo-h3">Cari Desa</h3>
            </Container>
        </>
    );
}
