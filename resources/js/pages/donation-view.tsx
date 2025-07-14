import Container from '@/components/container';
import Flash from '@/components/flash';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import VisitorLayout from '@/layouts/visitor-layout';
import { formatMoney } from '@/lib/utils';
import { SharedData } from '@/types';
import { Donation } from '@/types/model';
import { useForm, usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ShieldCheckIcon } from 'lucide-react';
import moment from 'moment';
import { useMemo } from 'react';

const DonationView = ({ donation }: { donation: Donation }) => {
    const { flash } = usePage<SharedData>().props;

    const { data, setData, post, errors, processing } = useForm<
        Required<{
            email: string;
            name: string;
            no_hp: string;
            gender: string;
            nominal: number;
        }>
    >({
        email: '',
        name: '',
        no_hp: '',
        gender: 'Bapak',
        nominal: 0,
    });

    const _donate = () => {
        post(route('donation.donate', { slug: donation.slug }), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const safeContent = useMemo(() => DOMPurify.sanitize(donation?.description ?? ''), [donation?.description]);

    return (
        <VisitorLayout>
            <Container>
                <Flash flash={flash} />

                <div className="flex h-fit flex-col gap-6 lg:flex-row">
                    <div className="lg:w-2/3">
                        <h1 className="typo-h1 mb-3">{donation.title}</h1>

                        <div className="flex w-fit mb-3 flex-col">
                            <small className="!typo-small text-muted-foreground">Dibuka oleh</small>
                            <h4 className="typo-h4">{donation.village?.village}</h4>
                            <p className="typo-p text-muted-foreground lowercase">
                                {donation.village?.district} • {donation.village?.city} • {donation.village?.province}
                            </p>
                            <Separator className="my-3" />
                            <p className="typo-p text-muted-foreground">{moment(donation.created_at).fromNow()}</p>
                        </div>

                        {donation.target && donation.target > 0 ? (
                            <div className="mb-6 max-w-md items-center">
                                <Progress value={Math.min(100, ((donation.donaturs_sum_nominal ?? 0) / donation.target) * 100)} />
                                <small className="!typo-small whitespace-nowrap text-muted-foreground">
                                    Terkumpul {formatMoney(donation.donaturs_sum_nominal)} / {formatMoney(donation.target)}
                                </small>
                            </div>
                        ) : null}

                        <div className="ql-editor !h-fit !p-0" dangerouslySetInnerHTML={{ __html: safeContent ?? '' }}></div>
                    </div>
                    <div className="lg:w-1/3">
                        <Card className="mb-3">
                            <CardHeader>
                                <CardTitle>Berikan sedekah Anda</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        _donate();
                                    }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="grid gap-2">
                                        <Label>Nominal</Label>
                                        <Input
                                            type="number"
                                            name="nominal"
                                            value={data.nominal}
                                            onChange={(e) => setData('nominal', +e.target.value)}
                                            required
                                        />
                                        <small className="typo-small text-muted-foreground">{formatMoney(data.nominal)}</small>
                                        <InputError className="mt-2" message={errors.nominal} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="grid w-1/3 gap-2">
                                            <Label>Panggilan</Label>
                                            <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Panggilan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="Bapak">Bapak</SelectItem>
                                                        <SelectItem value="Ibu">Ibu</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid w-2/3 gap-2">
                                            <Label>Nama</Label>
                                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required name="name" />
                                            <InputError className="mt-2" message={errors.name} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Email</Label>
                                        <Input value={data.email} onChange={(e) => setData('email', e.target.value)} required name="email" />
                                        <InputError className="mt-2" message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Nomor HP</Label>
                                        <Input value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} required name="no_hp" />
                                        <InputError className="mt-2" message={errors.no_hp} />
                                    </div>

                                    <Button disabled={processing}>
                                        <ShieldCheckIcon /> Bayar
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Para dermawan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {donation.donaturs?.map((data, i) => (
                                    <div key={i} className="mb-3 border-b pb-3">
                                        <div className="flex items-center justify-between">
                                            <p className="typo-p">{data.username}</p>
                                            <small className="typo-small text-muted-foreground">{moment(data.created_at).fromNow()}</small>
                                        </div>
                                        <p className="typo-p font-bold">{formatMoney(data.nominal)}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </VisitorLayout>
    );
};

export default DonationView;
