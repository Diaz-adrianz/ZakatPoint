import { SharedData } from '@/types';
import { AlertCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface Props {
    flash: SharedData['flash'];
}

const Flash = ({ flash }: Props) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        setShow(true);
    }, [flash]);

    if ((flash.error || flash.success) && show) {
        if (flash.error)
            return (
                <Alert onClick={() => setShow(false)} variant="destructive" className="mb-3">
                    <AlertCircleIcon />
                    <AlertTitle>Peringatan</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            );
        else if (flash.success)
            return (
                <Alert onClick={() => setShow(false)} variant="success" className="mb-3">
                    <AlertCircleIcon />
                    <AlertTitle>Berhasil</AlertTitle>
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            );
    }
    return null;
};

export default Flash;
