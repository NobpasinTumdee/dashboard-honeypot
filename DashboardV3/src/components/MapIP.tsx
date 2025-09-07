import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapIPProps {
    ipAddresses: string[];
}

interface IpLocation {
    ip: string;
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
}

const MapIP: React.FC<MapIPProps> = ({ ipAddresses }) => {
    const mapCenter: [number, number] = [20, 0];
    const [ipLocations, setIpLocations] = useState<IpLocation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchLocations = async () => {
            const fetchedData: IpLocation[] = [];

            for (const ip of ipAddresses) {
                try {
                    const response = await axios.get(`http://ip-api.com/json/${ip}`);
                    if (response.data.status === 'success') {
                        fetchedData.push({
                            ip: ip,
                            latitude: response.data.lat,
                            longitude: response.data.lon,
                            city: response.data.city,
                            country: response.data.country,
                        });
                    }
                } catch (error) {
                    console.error(`Failed to fetch location for IP: ${ip}`, error);
                }
            }

            setIpLocations(fetchedData);
            setLoading(false);
        };

        if (ipAddresses && ipAddresses.length > 0) {
            fetchLocations();
        } else {
            setLoading(false);
        }
    }, [ipAddresses]);

    if (loading) {
        return <div>Loading map data...</div>;
    }

    return (
        <MapContainer center={mapCenter} zoom={2} style={{ height: '600px', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {ipLocations.map((location) => (
                <Marker key={location.ip} position={[location.latitude, location.longitude]}>
                    <Popup>
                        <strong>IP:</strong> {location.ip} <br />
                        <strong>Location:</strong> {location.city}, {location.country}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapIP;



// attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
