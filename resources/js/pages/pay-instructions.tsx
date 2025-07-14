import Container from '@/components/container';
import VisitorLayout from '@/layouts/visitor-layout';
import { Head, usePage } from '@inertiajs/react';

const InstruksiPembayaran = () => {
    const { payment, zakatType } = usePage<{
        payment: {
            id: number;
            amount: number;
            description: string;
            method: string;
            channel: string;
        };
        zakatType: string;
    }>().props;

    return (
        <VisitorLayout>
            <Head title="Instruksi Pembayaran" />
            <Container className="py-10 text-center">
                <h1 className="typo-h1">Instruksi Pembayaran</h1>
                <p className="mt-4">
                    Anda akan membayar <strong>{zakatType}</strong> sejumlah:
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600">Rp {payment.amount.toLocaleString('id-ID')}</p>
                <p className="mt-4">Silakan transfer ke rekening:</p>
                <div className="inline-block rounded bg-gray-100 p-4">
                    <p>BCA 123456789 a.n. Panitia Zakat</p>
                    <p>Metode: {payment.channel.toUpperCase()}</p>
                </div>
                <p className="mt-6 text-sm text-gray-500">Setelah transfer, silakan konfirmasi ke admin.</p>
                {payment.method !== 'manual_transfer' && (
                    <div className="mt-8">
                        <a
                            // href={`/bayar/${payment.id}`} // route ini akan handle redirect ke Midtrans/Xendit
                            className="btn btn-success"
                        >
                            Bayar Sekarang
                        </a>
                    </div>
                )}
            </Container>
        </VisitorLayout>
    );
};

export default InstruksiPembayaran;
