import Container from '@/components/container';
import Flash from '@/components/flash';
import MapPicker from '@/components/map-picker';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SharedData } from '@/types';
import { PaginatedResponse, Village } from '@/types/model';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';

export default function ExploreVillages({villages, query}: {query: {search?: string}, villages : PaginatedResponse<Village>}) {
    const { flash } = usePage<SharedData>().props

    const {data, setData, get, post} = useForm<{search?: string}>({
        search: query.search ?? ''
    })

    const joinForm = useForm<{village_id?: number}>({});

    const [longLat, setLongLat] = useState({long: 0, lat: 0})
    const [openMap, setOpenMap] = useState(false)

    const _joinVillage = (villageId: number) => {
        joinForm.data.village_id = villageId;
        joinForm.post(route('join-village'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Cari desa" />
            <Container className="flex flex-col gap-3 max-w-xl">
                <h3 className="typo-h3">Cari Desa</h3>

                <Flash flash={flash}/>
            
                <form onSubmit={e => {
                    e.preventDefault();
                    get(route("explore-villages"), {
                        preserveState: true,   
                        preserveScroll: true,  
                        replace: true 
                    });
                }}>
                    <Input
                        name="search"
                        placeholder='Cari...'
                        value={data.search}
                        onChange={e => setData('search', e.target.value)}
                    />
                </form>

                {
                    villages.data.map((dat, i)=> 
                        <Card key={i} className='mb-2'>
                            <CardHeader>
                                <CardTitle>{dat.village}</CardTitle>
                                <CardDescription className='lowercase'>{dat.district} • {dat.city} • {dat.province}</CardDescription>
                            </CardHeader>
                            <CardFooter className='gap-3'>
                                <Button 
                                    variant={'outline'}
                                    onClick={() => {
                                        if (dat.longitude && dat.latitude) {
                                            setLongLat({long: +dat.longitude, lat: +dat.latitude})
                                            setOpenMap(true)
                                        }
                                    }}
                                >
                                    Lihat peta
                                </Button>
                                <Button onClick={() => _joinVillage(dat.id)}>
                                    Gabung
                                </Button>
                            </CardFooter>
                        </Card>                    
                    )
                }

                <div className="flex gap-3 mt-3 items-center justify-center">
                    {
                        villages.prev_page_url && 
                        <Button variant={'outline'} size={'icon'} asChild>
                            <Link href={villages.prev_page_url}>
                                <ChevronLeftIcon />
                            </Link>
                        </Button>
                    }
                    <p className="typo-p">{villages.current_page} - {villages.last_page}</p>
                    {
                        villages.next_page_url &&
                        <Button variant={'outline'} size={'icon'} asChild>
                            <Link href={villages.next_page_url}>
                                <ChevronRightIcon />
                            </Link>
                        </Button>
                    }
                </div>


            </Container>

            <Dialog open={openMap} onOpenChange={setOpenMap}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Peta lokasi</DialogTitle>
                </DialogHeader>
                    <div className="w-full h-80">
                        <MapPicker 
                            latitude={longLat.lat}
                            longitude={longLat.long}
                            onChange={() => {}}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
