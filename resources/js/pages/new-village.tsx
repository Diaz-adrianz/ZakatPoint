import Container from '@/components/container';
import InputError from '@/components/input-error';
import MapPicker from '@/components/map-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { District, Province, Regency, Village } from '@/types/region';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type VillageForm = {
    province: string;
    city: string;
    district: string;
    village: string;
    postal_code: string;
    longitude: string;
    latitude: string;
    email_village: string;
};

export default function NewVillage({ provinces }: { provinces: Province[] }) {
    const { data, setData, post, errors, processing } = useForm<Required<VillageForm>>({
        province: '',
        city: '',
        district: '',
        village: '',
        postal_code: '',
        longitude: '',
        latitude: '',
        email_village: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('village.store'), {
            preserveScroll: true,
        });
    };

    const [regencies, setRegencies] = useState<Regency[]>([]);
    const getRegencies = async (provinceName: string) => {
        setData('city', '');
        setData('district', '');
        setData('village', '');

        const prov = provinces.find((p) => p.name == provinceName);
        if (prov)
            fetch('/api/regencies/' + prov.id)
                .then((res) => res.json())
                .then((data) => setRegencies(data));
    };

    const [districts, setDistricts] = useState<District[]>([]);
    const getDistricts = async (regencyName: string) => {
        setData('district', '');
        setData('village', '');

        const reg = regencies.find((p) => p.name == regencyName);
        if (reg)
            fetch('/api/districts/' + reg.id)
                .then((res) => res.json())
                .then((data) => setDistricts(data));
    };

    const [villages, setVillages] = useState<Village[]>([]);
    const getVillages = async (districtName: string) => {
        setData('village', '');

        const dis = districts.find((p) => p.name == districtName);
        if (dis)
            fetch('/api/villages/' + dis.id)
                .then((res) => res.json())
                .then((data) => setVillages(data));
    };

    return (
        <>
            <Head title="Daftarkan desa" />
            <Container className="flex max-w-xl flex-col gap-3">
                <h3 className="typo-h3">Daftarkan Desa</h3>

                <form onSubmit={submit}>
                    <Card>
                        <CardContent className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label>Provinsi</Label>
                                <Select
                                    value={data.province}
                                    onValueChange={(v) => {
                                        setData('province', v);
                                        getRegencies(v);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih provinsi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((p, i) => (
                                            <SelectItem key={i} value={p.name}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError className="mt-2" message={errors.province} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kota/Kabupaten</Label>
                                <Select
                                    disabled={regencies.length == 0}
                                    value={data.city}
                                    onValueChange={(v) => {
                                        setData('city', v);
                                        getDistricts(v);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kota/kabupaten" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regencies.map((p, i) => (
                                            <SelectItem key={i} value={p.name}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError className="mt-2" message={errors.city} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kecamatan</Label>
                                <Select
                                    disabled={districts.length == 0}
                                    value={data.district}
                                    onValueChange={(v) => {
                                        setData('district', v);
                                        getVillages(v);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {districts.map((p, i) => (
                                            <SelectItem key={i} value={p.name}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError className="mt-2" message={errors.district} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Desa</Label>
                                <Select
                                    disabled={villages.length == 0}
                                    value={data.village}
                                    onValueChange={(v) => {
                                        setData('village', v);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih desa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {villages.map((p, i) => (
                                            <SelectItem key={i} value={p.name}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError className="mt-2" message={errors.village} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kode pos</Label>

                                <Input
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    required
                                    autoComplete="postal_code"
                                    placeholder="Kode pos"
                                />

                                <InputError className="mt-2" message={errors.postal_code} />
                            </div>

                            <div className="h-80 w-full">
                                <MapPicker
                                    latitude={+data.latitude}
                                    longitude={+data.longitude}
                                    onChange={({ latitude, longitude }) => {
                                        setData('longitude', longitude.toString());
                                        setData('latitude', latitude.toString());
                                    }}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Email desa</Label>

                                <Input
                                    type="email"
                                    value={data.email_village}
                                    onChange={(e) => setData('email_village', e.target.value)}
                                    required
                                    autoComplete="email_village"
                                    placeholder="Email desa"
                                />

                                <InputError className="mt-2" message={errors.email_village} />
                            </div>

                            <Button disabled={processing}>Daftar</Button>
                        </CardContent>
                    </Card>
                </form>
            </Container>
        </>
    );
}
