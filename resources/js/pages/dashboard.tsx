import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatMoney } from '@/lib/utils';
import { PieChart, Tooltip, Pie, Cell, ResponsiveContainer } from 'recharts';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dasbor',
    },
];

export default function Dashboard({
    stats,
}: {
    stats?: { total: number; zakatGold: number; zakatSilver: number; zakatIncome: number; zakatFitrah: number; donaturs: number };
}) {

    const pieChartData = useMemo(() => [
        { name: 'Zakat emas', value: stats?.zakatGold || 0 },
        { name: 'Zakat perak', value: stats?.zakatSilver || 0 },
        { name: 'Zakat penghasilan', value: stats?.zakatIncome || 0 },
        { name: 'Zakat Fitrah', value: stats?.zakatFitrah || 0 },
        { name: 'Sedekah', value: stats?.donaturs || 0 }
    ], [stats])

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor" />

            {stats && (
                <>
                    <div className="flex flex-wrap gap-3">
                        <Card className="min-w-80">
                            <CardHeader>
                                <CardDescription>Total terkumpul</CardDescription>
                                <CardTitle className="typo-h3">{formatMoney(stats?.total, { shorten: true })}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="min-w-80">
                            <CardHeader>
                                <CardDescription>Zakat Emas</CardDescription>
                                <CardTitle className="typo-h3">{formatMoney(stats?.zakatGold, { shorten: true })}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="min-w-80">
                            <CardHeader>
                                <CardDescription>Zakat Perak</CardDescription>
                                <CardTitle className="typo-h3">{formatMoney(stats?.zakatSilver, { shorten: true })}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="min-w-80">
                            <CardHeader>
                                <CardDescription>Zakat Penghasilan</CardDescription>
                                <CardTitle className="typo-h3">{formatMoney(stats?.zakatIncome, { shorten: true })}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="min-w-80">
                            <CardHeader>
                                <CardDescription>Zakat Fitrah</CardDescription>
                                <CardTitle className="typo-h3">{formatMoney(stats?.zakatFitrah, { shorten: true })}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="min-w-80">
                            <CardHeader>
                                <CardDescription>Sedekah</CardDescription>
                                <CardTitle className="typo-h3">{formatMoney(stats?.donaturs)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <div className="mt-8">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={120}
                                    fill="#8884d8"
                                    label={({ value }) => `${formatMoney(value, { shorten: true })}`}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatMoney(+value, { shorten: false })}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
