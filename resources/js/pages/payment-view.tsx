import Container from '@/components/container';
import Flash from '@/components/flash';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/lib/utils';
import { SharedData } from '@/types';
import { Payment } from '@/types/model';
import { Head, usePage } from '@inertiajs/react';
import { ShieldCheckIcon } from 'lucide-react';
import { useEffect} from 'react';

const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

const PaymentView = ({ payment }: { payment: Payment }) => {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-client-key', midtransClientKey);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const _pay = () => {
        if (payment.snap_token)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).snap.pay(payment.snap_token, {});
    };

    return (
        <>
            <Head title="Pembayaran" />

            <Container>
                <Flash flash={flash} />
                <h3 className="typo-h3 text-center">Pembayaran</h3>
            </Container>
            <Container className="flex max-w-md flex-col gap-3 rounded-sm border border-primary/20 bg-primary/5">
                <div className="flex w-full justify-between">
                    <p className="typo-p">Penerima</p>
                    <p className="typo-p font-bold">
                        {payment.first_name} {payment.last_name}
                    </p>
                </div>

                <div className="flex w-full justify-between">
                    <p className="typo-p">Metode pembayaran</p>
                    <p className="typo-p font-bold">{payment.payment_type}</p>
                </div>

                <div className="flex w-full justify-between">
                    <p className="typo-p">Status</p>
                    <p className="typo-p animate-pulse font-bold">{payment.status}</p>
                </div>

                <div className="flex w-full justify-between">
                    <p className="typo-p">Tenggat</p>
                    <p className="typo-p font-bold">{payment.expired_at}</p>
                </div>

                <Separator className="my-3" />

                {payment.items?.map((item, i) => (
                    <div key={i} className="flex w-full justify-between">
                        <p className="typo-p">{item.name}</p>
                        <p className="typo-p font-bold">{formatMoney(item.price)}</p>
                    </div>
                ))}

                <Separator className="my-3" />

                <div className="flex w-full items-center justify-between">
                    <p className="typo-p">Total</p>
                    <p className="typo-h3 font-bold">{formatMoney(payment.amount)}</p>
                </div>

                <Button className="mt-6" onClick={_pay}>
                    <ShieldCheckIcon /> Bayar
                </Button>
            </Container>
        </>
    );
};

export default PaymentView;
