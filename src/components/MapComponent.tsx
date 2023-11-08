import 'leaflet/dist/leaflet.css';
import {MapContainer, Marker, Popup, TileLayer, LayerGroup} from 'react-leaflet';
import L, {LatLng} from 'leaflet';
import axios, {AxiosResponse} from 'axios';
import {useEffect, useState} from 'react';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { station } from '../atoms';

// Red and green icon URLs
const redIconUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
const greenIconUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';

const redIcon = new L.Icon({
    iconUrl: redIconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
    iconUrl: greenIconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface RadiationData {
    type: string;
    features: Feature[];
}

interface Feature {
    id: number;
    type: string;
    geometry: Geometry;
    properties: Properties;
}

interface Geometry {
    type: string;
    coordinates: number[];
}

interface Properties {
    prop_alarm: boolean;
    prop_dt: number;
    prop_name: string;
    prop_value: number;
}

function MapComponent() {
    const position = new LatLng(48.6811522, 19.7028646); // Slovakia.
    const [stations, setStations] = useState<Feature[] | null>(null);
    const [stationValue, setStationValue] = useRecoilState(station);

    const getStationDetail = (id: number, name :string) => {
        setStationValue((prevState: any) => ({
        ...prevState,
        id: id,
        name: name,
        }));
    };
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: AxiosResponse<RadiationData> = await axios.get<RadiationData>(
                    'https://w5.shmu.sk/api/v1/meteo/getradiationgeojson');
                setStations(response.data.features);
            } catch (error) {
                console.log('something went wrong...')
            }
        };
        fetchData().then();
    }, []);

    const unixTimestampConverter = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const formattedDateTime = format(date, "dd.MM.yyyy HH:mm");
        
        return (
            <p>Date: {formattedDateTime}</p>
        );
    };

    if (stations === null) {
        return (
            <div className={'loader'}></div>
        )
    }

    return (
        <>
            <MapContainer
                center={position}
                zoom={8}
                scrollWheelZoom={true}
            >
                {/* <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                /> */}
                <TileLayer
                    attribution="Google Maps"
                    url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                />
                {/* <LayerGroup>
                    <TileLayer
                        attribution="Google Maps Satellite"
                        url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                    />
                    <TileLayer url="https://www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}" />
                </LayerGroup> */}
                {stations.map((feature, index) => (
                    <Marker
                        key={index}
                        position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                        icon={feature.properties.prop_alarm ? redIcon : greenIcon}
                    >
                        <Popup>
                            <div>
                                <h5>Radiation Data</h5>
                                <p>Name: {feature.properties.prop_name}</p>
                                <p>Alarm: {feature.properties.prop_alarm.toString()}</p>
                                {unixTimestampConverter(feature.properties.prop_dt)}
                                <p>Value: {feature.properties.prop_value} nSv/h</p>
                                <small>ID: {feature.id}</small>
                                <button onClick={() => {getStationDetail(feature.id, feature.properties.prop_name)}}>Detail</button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </>
    )
}

export default MapComponent
