import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { UserVillage } from '@/types/model';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDownIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const SelectVillage = () => {
    const villageId = usePage<SharedData>().props.villageId;

    const [expand, setExpand] = useState(false);

    const setCookie = useCallback((id: string) => {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 20);

        document.cookie = `village_id=${id}; path=/; expires=${expires.toUTCString()};`;

        window.location.reload();
    }, []);

    const [villages, setVillages] = useState<UserVillage[]>([]);
    const getVillages = () => {
        fetch('/api/user-villages')
            .then((res) => res.json())
            .then((data) => {
                setVillages(data);
                if (!data.length) setExpand(true);
            });
    };

    useEffect(() => {
        getVillages();
    }, []);

    return (
        <div className="relative flex flex-col items-stretch gap-3 rounded-md border bg-background p-3 pb-8 text-foreground">
            {
                villages.length ? 
                    <div>
                        <Select defaultValue={villageId} onValueChange={setCookie}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="Pilih desa" />
                            </SelectTrigger>
                            <SelectContent>
                                {villages.map((v, i) => (
                                    <SelectItem key={i} value={v.village_id.toString()}>
                                        <p className="typo-p">
                                            {v.village?.village} <span className="typo-small text-muted-foreground">⎯ {v.role}</span>
                                        </p>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    : null
            }

            {expand && (
                <>
                    <Button variant={'secondary'} size={'sm'} asChild>
                        <Link href="/cari-desa" prefetch>
                            <SearchIcon />
                            Cari desa
                        </Link>
                    </Button>
                    <Button variant={'secondary'} size={'sm'} asChild>
                        <Link href="/tambah-desa" prefetch>
                            <PlusIcon />
                            Daftarkan desa
                        </Link>
                    </Button>
                </>
            )}

            <Button
                variant={'ghost'}
                size={'sm'}
                className="absolute right-0 bottom-0 left-0 h-6 rounded-t-none"
                onClick={() => setExpand((s) => !s)}
            >
                <ChevronDownIcon className={cn(expand ? 'rotate-180' : 'rotate-0', 'transition-transform')} />
            </Button>
        </div>
    );
};

export default SelectVillage;
