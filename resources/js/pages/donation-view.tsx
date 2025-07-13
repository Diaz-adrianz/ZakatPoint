import Container from '@/components/container';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import VisitorLayout from '@/layouts/visitor-layout';
import { formatMoney } from '@/lib/utils';
import { Donation } from '@/types/model';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { useMemo } from 'react';

const DonationView = ({ donation }: { donation: Donation }) => {
    const safeContent = useMemo(() => DOMPurify.sanitize(donation?.description ?? ''), [donation?.description]);

    return (
        <VisitorLayout>
            <Container className="flex flex-col gap-6">
                <h1 className="typo-h1">{donation.title}</h1>

                <div className="flex w-fit flex-col">
                    <small className="!typo-small text-muted-foreground">Dibuka oleh</small>
                    <h4 className="typo-h4">{donation.village?.village}</h4>
                    <p className="typo-p text-muted-foreground lowercase">
                        {donation.village?.district} • {donation.village?.city} • {donation.village?.province}
                    </p>
                    <Separator className="my-3" />
                    <p className="typo-p text-muted-foreground">{moment(donation.created_at).fromNow()}</p>
                </div>

                {
                    donation.target && donation.target > 0 ?
                        <div className='max-w-md mb-3 items-center'>
                            <Progress value={Math.min(100, ((donation.donaturs_sum_nominal ?? 0) / donation.target) * 100)} />
                            <small className='!typo-small text-muted-foreground whitespace-nowrap'>
                            Terkumpul {formatMoney(donation.donaturs_sum_nominal)} / {formatMoney(donation.target)} 
                            </small>
                        </div>
                    : null
                }

                <div className="ql-editor !p-0" dangerouslySetInnerHTML={{ __html: safeContent ?? '' }}></div>
            </Container>
        </VisitorLayout>
    );
};

export default DonationView;
