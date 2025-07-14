import Container from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/lib/utils';
import { FitrahZakatPeriode } from '@/types/model';
import { Head } from '@inertiajs/react';
import moment from 'moment';

export default function ZakatFitrahPeriodeView({periode}: {periode: FitrahZakatPeriode}) {
    return (
        <Container>
            <Head title="Zakat fitrah" />
            <div className="mb-6">
                <h1 className="typo-h1">{periode.title}</h1>
                <p className="typo-p text-muted-foreground">
                    {moment(periode.start_date).format('DD MMM YYYY')} s/d {moment(periode.end_date).format('DD MMM YYYY')}
                </p>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-">
                <div className="flex w-fit mb-3 flex-col">
                    <small className="!typo-small text-muted-foreground">Dibuka oleh</small>
                    <h4 className="typo-h4">{periode.village?.village}</h4>
                    <p className="typo-p text-muted-foreground lowercase">
                        {periode.village?.district} • {periode.village?.city} • {periode.village?.province}
                    </p>
                </div>
                <div>
                    <h4 className="typo-h4">{formatMoney(periode.zakats_sum_amount)}</h4>
                    <p className="typo-p text-muted-foreground lowercase">
                        Terkumpul
                    </p>
                </div>
                <div>
                    <h4 className="typo-h4">{formatMoney(periode.rice_price)}</h4>
                    <p className="typo-p text-muted-foreground lowercase">
                        Harga beras per 1 sha' di desa
                    </p>
                </div>
            </div>

            <Separator className="my-3" />
            <p className="typo-p mb-3 text-muted-foreground">{moment(periode.created_at).fromNow()}</p>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Muzakki</CardTitle>
                </CardHeader>
                <CardContent>
                    {periode.zakats?.map((data, i) => (
                        <div key={i} className="mb-3 border-b pb-3">
                            <div className="flex items-center justify-between">
                                <p className="typo-p">{data.name}</p>
                                <small className="typo-small text-muted-foreground">{moment(data.created_at).fromNow()}</small>
                            </div>
                            <div className="flex items-center justify-between">
                                <small className="typo-small text-muted-foreground">Tanggungan: {data.dependents}</small>
                                <p className="typo-p font-bold">{formatMoney(data.amount)}</p>
                            </div>

                        </div>
                    ))}
                </CardContent>
            </Card>

        </Container>
    );
}
