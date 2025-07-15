import Container from '@/components/container';
import VisitorLayout from '@/layouts/visitor-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PayZakatEmas from './pay-zakat-gold';
import PayZakatPenghasilan from './pay-zakat-income';
import PayZakatPerak from './pay-zakat-silver';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Village {
    id: number;
    name: string;
}

export default function PayZakat() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Village[]>([]);
    const [village, setVillage] = useState<Village | null>(null);
    const [zakatType, setZakatType] = useState('income');
    const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    useEffect(() => {
        if (!query) return setSuggestions([]);
        const timeout = setTimeout(() => {
            fetch(`/api/villages/search?q=${encodeURIComponent(query)}`)
                .then((r) => r.json())
                .then(setSuggestions);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        const fetchSessionAndRedirect = async () => {
            if (zakatType !== 'fitrah' || !village) return;

            const res = await fetch(`/fitrah-session/by-village/${village.id}`);
            const data = await res.json();

            if (data.available && data.code) {
                window.location.href = `/bayar-zakat-fitrah/${data.code}?village_name=${encodeURIComponent(village.name)}`;
            } else {
                alert(`Zakat fitrah belum tersedia untuk desa ini saat ini. Mungkin belum masuk periode Ramadhan.`);
                setZakatType('income'); // balik ke zakat lain
            }
        };

        fetchSessionAndRedirect();
    }, [zakatType, village]);

    return (
        <VisitorLayout>
            <Head title="Bayar Zakat" />
            <Container className="flex flex-col items-center gap-6">
                <h1 className="typo-h1">Salurkan Zakat Anda</h1>
            </Container>
            <Container className='flex flex-col max-w-lg border rounded-md gap-6'>

                <div className="grid gap-2">
                    <Label>Jenis zakat</Label>
                    <Select value={zakatType} onValueChange={setZakatType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Zakat Penghasilan</SelectItem>
                            <SelectItem value="gold">Zakat Emas</SelectItem>
                            <SelectItem value="silver">Zakat Perak</SelectItem>
                            <SelectItem value="fitrah">Zakat Fitrah</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Desa</Label>
                    <div className="w-full space-y-4">
                        {/* Autocomplete desa */}
                        <div className="relative">
                            <Input 
                                placeholder='Cari desa...'
                                value={village ? village.name : query}
                                onChange={e => {
                                    setVillage(null);
                                    setQuery(e.target.value);
                                }}
                            />
                            {suggestions.length > 0 && !village && (
                                <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded border bg-white shadow">
                                    {suggestions.map((v) => (
                                        <li
                                            key={v.id}
                                            className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                            onClick={() => {
                                                setVillage(v);
                                                setQuery('');
                                                setSuggestions([]);
                                            }}
                                        >
                                            {v.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>
                </div>
                
                {zakatType === 'income' && <PayZakatPenghasilan village={village} csrf={csrf} />}
                {zakatType === 'gold' && <PayZakatEmas village={village} csrf={csrf} />}
                {zakatType === 'silver' && <PayZakatPerak village={village} csrf={csrf} />}
            </Container>
        </VisitorLayout>
    );
}
