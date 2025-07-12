import { Icon, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

interface MapPickerProps {
    latitude?: number;
    longitude?: number;
    onChange: (coords: { latitude: number; longitude: number }) => void;
    zoom?: number;
}

const defaultIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const DEFAULT_LATITUDE = -6.917464;
const DEFAULT_LONGITUDE = 107.619123;

const MapPicker: React.FC<MapPickerProps> = ({ latitude = DEFAULT_LATITUDE, longitude = DEFAULT_LONGITUDE, onChange, zoom = 13 }) => {
    const [position, setPosition] = useState<LatLngTuple>([latitude, longitude]);
    const [mapReady, setMapReady] = useState(false);
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (geoPosition) => {
                    const lat = geoPosition.coords.latitude;
                    const lng = geoPosition.coords.longitude;
                    setPosition([lat, lng]);
                    onChange({ latitude: lat, longitude: lng });
                    setMapReady(true);
                },
                (error) => {
                    console.error('Error getting geolocation:', error);
                    setPosition([latitude, longitude]);
                    onChange({ latitude: latitude, longitude: longitude });
                    setMapReady(true);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
            );
        } else {
            console.warn('Geolocation is not supported by this browser.');
            setPosition([latitude, longitude]);
            onChange({ latitude: latitude, longitude: longitude });
            setMapReady(true);
        }
    }, []);

    useEffect(() => {
        if (mapReady) {
            setPosition([latitude, longitude]);
        }
    }, [latitude, longitude, mapReady]);

    const MapEvents = () => {
        const map = useMapEvents({
            click: (e) => {
                const newLat = e.latlng.lat;
                const newLng = e.latlng.lng;
                setPosition([newLat, newLng]);
                onChange({ latitude: newLat, longitude: newLng });
                map.panTo([newLat, newLng]);
            },
        });
        return null;
    };

    if (!mapReady) {
        return (
            <div className="flex size-full items-center justify-center">
                <p className="typo-large">Memuat lokasi...</p>
            </div>
        );
    }

    return (
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={true} className="size-full" key={position[0] + '-' + position[1]}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
            <Marker
                position={position}
                draggable={true}
                eventHandlers={{
                    dragend() {
                        const marker = markerRef.current;
                        if (marker != null) {
                            const newLat = marker.getLatLng().lat;
                            const newLng = marker.getLatLng().lng;
                            setPosition([newLat, newLng]);
                            onChange({ latitude: newLat, longitude: newLng });
                        }
                    },
                }}
                icon={defaultIcon}
                ref={markerRef}
            />
        </MapContainer>
    );
};

export default MapPicker;
