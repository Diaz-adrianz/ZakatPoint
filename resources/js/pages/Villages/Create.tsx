import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Region {
    id: string;
    name: string;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        province: '',
        city: '',
        district: '',
        village: '',
        postal_code: '',
        longitude: '',
        latitude: '',
        email_village: '',
    });

    const [provinces, setProvinces] = useState<Region[]>([]);
    const [regencies, setRegencies] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [villagesApi, setVillagesApi] = useState<Region[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');

    // Fetch provinsi saat awal
    useEffect(() => {
        fetch('/api/provinces')
            .then((res) => res.json())
            .then(setProvinces);
    }, []);

    // Fetch kabupaten saat provinsi dipilih
    useEffect(() => {
        if (selectedProvinceId) {
            fetch(`/api/regencies/${selectedProvinceId}`)
                .then((res) => res.json())
                .then(setRegencies);
        } else {
            setRegencies([]);
            setData('city', '');
            setSelectedCityId('');
        }
        setDistricts([]);
        setVillagesApi([]);
        setData('district', '');
        setData('village', '');
        setSelectedDistrictId('');
    }, [selectedProvinceId]);

    // Fetch kecamatan saat kabupaten dipilih
    useEffect(() => {
        if (selectedCityId) {
            fetch(`/api/districts/${selectedCityId}`)
                .then((res) => res.json())
                .then(setDistricts);
        } else {
            setDistricts([]);
            setData('district', '');
            setSelectedDistrictId('');
        }
        setVillagesApi([]);
        setData('village', '');
    }, [selectedCityId]);

    // Fetch desa saat kecamatan dipilih
    useEffect(() => {
        if (selectedDistrictId) {
            fetch(`/api/villages/${selectedDistrictId}`)
                .then((res) => res.json())
                .then(setVillagesApi);
        } else {
            setVillagesApi([]);
            setData('village', '');
        }
    }, [selectedDistrictId]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/daftar-desa');
    };

    return (
        <>
            <Head title="Tambah Desa" />
            <div className="mx-auto max-w-xl p-6">
                <h1 className="mb-4 text-2xl font-bold">Tambah Desa</h1>
                <form onSubmit={submit} className="space-y-4">
                    {/* Provinsi */}
                    <select
                        value={selectedProvinceId}
                        onChange={(e) => {
                            const id = e.target.value;
                            const name = e.target.options[e.target.selectedIndex].text;
                            setSelectedProvinceId(id);
                            setData('province', name);
                        }}
                        className="input"
                    >
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((prov) => (
                            <option key={prov.id} value={prov.id}>
                                {prov.name}
                            </option>
                        ))}
                    </select>

                    {/* Kabupaten */}
                    <select
                        value={selectedCityId}
                        onChange={(e) => {
                            const id = e.target.value;
                            const name = e.target.options[e.target.selectedIndex].text;
                            setSelectedCityId(id);
                            setData('city', name);
                        }}
                        disabled={!regencies.length}
                        className="input"
                    >
                        <option value="">Pilih Kabupaten/Kota</option>
                        {regencies.map((reg) => (
                            <option key={reg.id} value={reg.id}>
                                {reg.name}
                            </option>
                        ))}
                    </select>

                    {/* Kecamatan */}
                    <select
                        value={selectedDistrictId}
                        onChange={(e) => {
                            const id = e.target.value;
                            const name = e.target.options[e.target.selectedIndex].text;
                            setSelectedDistrictId(id);
                            setData('district', name);
                        }}
                        disabled={!districts.length}
                        className="input"
                    >
                        <option value="">Pilih Kecamatan</option>
                        {districts.map((dis) => (
                            <option key={dis.id} value={dis.id}>
                                {dis.name}
                            </option>
                        ))}
                    </select>

                    {/* Desa */}
                    <select
                        value={data.village}
                        onChange={(e) => setData('village', e.target.value)}
                        disabled={!villagesApi.length}
                        className="input"
                    >
                        <option value="">Pilih Desa</option>
                        {villagesApi.map((vil) => (
                            <option key={vil.id} value={vil.name}>
                                {vil.name}
                            </option>
                        ))}
                    </select>

                    {/* Tambahan data */}
                    <input
                        type="text"
                        placeholder="Kode Pos"
                        value={data.postal_code}
                        onChange={(e) => setData('postal_code', e.target.value)}
                        className="input"
                    />
                    <input
                        type="text"
                        placeholder="Longitude"
                        value={data.longitude}
                        onChange={(e) => setData('longitude', e.target.value)}
                        className="input"
                    />
                    <input
                        type="text"
                        placeholder="Latitude"
                        value={data.latitude}
                        onChange={(e) => setData('latitude', e.target.value)}
                        className="input"
                    />
                    <input
                        type="email"
                        placeholder="Email Desa"
                        value={data.email_village}
                        onChange={(e) => setData('email_village', e.target.value)}
                        className="input"
                    />

                    <button type="submit" disabled={processing} className="btn btn-primary">
                        Simpan
                    </button>

                    {Object.keys(errors).length > 0 && (
                        <div className="mt-2 text-sm text-red-500">
                            {Object.values(errors).map((e, i) => (
                                <div key={i}>{e}</div>
                            ))}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}
