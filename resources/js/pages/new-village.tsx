import Container from '@/components/container';
import { Head } from '@inertiajs/react';

export default function NewVillage() {
    return (
        <>
            <Head title="Daftarkan desa" />
            <Container className="flex flex-col gap-3">
                <h3 className="typo-h3">Daftarkan Desa</h3>
            </Container>
        </>
    );
}
