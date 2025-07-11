import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Region {
    id: string;
    name: string;
}

interface Village {
    id: number;
    province: string;
    city: string;
    district: string;
    village: string;
    postal_code: string;
}

interface Props {
    villages: Village[];
    provinces: Region[];
}

export default function Index({ villages, provinces }: Props) {
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedRegencyId, setSelectedRegencyId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');

    const [regencies, setRegencies] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);

    // Fetch regencies ketika provinsi dipilih
    useEffect(() => {
        if (selectedProvinceId) {
            fetch(`/api/regencies/${selectedProvinceId}`)
                .then((res) => res.json())
                .then(setRegencies);
        } else {
            setRegencies([]);
            setSelectedRegencyId('');
        }
        setDistricts([]);
        setSelectedDistrictId('');
    }, [selectedProvinceId]);

    // Fetch districts ketika kabupaten dipilih
    useEffect(() => {
        if (selectedRegencyId) {
            fetch(`/api/districts/${selectedRegencyId}`)
                .then((res) => res.json())
                .then(setDistricts);
        } else {
            setDistricts([]);
            setSelectedDistrictId('');
        }
    }, [selectedRegencyId]);

    // Dapatkan nama wilayah dari ID terpilih
    const selectedProvinceName = provinces.find((p) => p.id === selectedProvinceId)?.name;
    const selectedRegencyName = regencies.find((r) => r.id === selectedRegencyId)?.name;
    const selectedDistrictName = districts.find((d) => d.id === selectedDistrictId)?.name;

    // Filter desa berdasarkan nama wilayah
    const filteredVillages =
        selectedProvinceName && selectedRegencyName && selectedDistrictName
            ? villages.filter((v) => v.province === selectedProvinceName && v.city === selectedRegencyName && v.district === selectedDistrictName)
            : [];

    return (
        <>
            <Head title="Daftar Desa" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Daftar Desa</h1>

                {/* Filter Dropdown */}
                <div className="mb-4 flex flex-col gap-3 md:flex-row">
                    {/* Provinsi */}
                    <select value={selectedProvinceId} onChange={(e) => setSelectedProvinceId(e.target.value)} className="input">
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((prov) => (
                            <option key={prov.id} value={prov.id}>
                                {prov.name}
                            </option>
                        ))}
                    </select>

                    {/* Kabupaten */}
                    <select
                        value={selectedRegencyId}
                        onChange={(e) => setSelectedRegencyId(e.target.value)}
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
                        onChange={(e) => setSelectedDistrictId(e.target.value)}
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
                </div>

                {/* Tampilkan daftar desa */}
                <div className="grid gap-4">
                    {selectedProvinceId && selectedRegencyId && selectedDistrictId ? (
                        filteredVillages.length ? (
                            filteredVillages.map((village) => (
                                <div key={village.id} className="rounded-lg border p-4 shadow-sm">
                                    <div>
                                        <strong>Provinsi:</strong> {village.province}
                                    </div>
                                    <div>
                                        <strong>Kab/Kota:</strong> {village.city}
                                    </div>
                                    <div>
                                        <strong>Kecamatan:</strong> {village.district}
                                    </div>
                                    <div>
                                        <strong>Desa:</strong> {village.village}
                                    </div>
                                    <div>
                                        <strong>Kode Pos:</strong> {village.postal_code}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">Tidak ada desa di kecamatan ini.</div>
                        )
                    ) : (
                        <div className="text-gray-400">Silakan pilih Provinsi, Kabupaten, dan Kecamatan terlebih dahulu.</div>
                    )}
                </div>

                <Link href="/daftar-desa/create" className="btn btn-sm btn-primary mt-6 inline-block">
                    + Tambah Desa
                </Link>
            </div>
        </>
    );
}
