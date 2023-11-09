import 'leaflet/dist/leaflet.css';
import {CircleMarker, MapContainer, Popup, TileLayer} from 'react-leaflet';
import {LatLng} from 'leaflet';
import axios, {AxiosResponse} from 'axios';
import {useEffect, useRef, useState} from 'react';
import {format} from 'date-fns';
import {useRecoilState} from 'recoil';
import {station, tableData} from '../atoms';

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
    const [_tableData, setTableData] = useRecoilState(tableData);
    const [hasError, setHasError] = useState(false);
    const markerRefs = useRef<{ [key: number]: any }>({});

    const getStationDetail = (id: number, name: string) => {
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
                setTableData({values: response.data.features});
            } catch (error) {
                console.log('something went wrong...')
                setHasError(true);
            }
        };
        fetchData().then();
    }, []);

    useEffect(() => {
        const markerRef = markerRefs.current[stationValue.id];
        if (markerRef) {
            markerRef.openPopup();
        }
    })

    const unixTimestampConverter = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const formattedDateTime = format(date, "dd.MM.yyyy HH:mm");

        return (
            <p>Date: {formattedDateTime}</p>
        );
    };

    if (hasError) {
        return (
            <div className={'e-message'}>Sorry, something went wrong...</div>
        )
    }

    if (stations === null) {
        return (
            <div className={'loader'}></div>
        )
    }

    const handleMarkerClick = (id: number, name: string) => {
        getStationDetail(id, name);
    }

    const handleMarkerPopupClose = () => {
        setStationValue({id: null, name: null});
    }

    return (
        <>
            <MapContainer
                center={position}
                zoom={8}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution="Google Maps"
                    url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                />
                {stations.map((feature: Feature) => (
                    <CircleMarker
                        key={feature.id}
                        center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                        fillColor={feature.properties.prop_alarm ? 'red' : 'green'}
                        color={'#000'}
                        fillOpacity={100}
                        weight={1}
                        eventHandlers={{
                            click: () => {
                                handleMarkerClick(feature.id, feature.properties.prop_name);
                            },
                            popupclose: () => handleMarkerPopupClose(),
                        }}
                        ref={(ref) => (markerRefs.current[feature.id] = ref)}
                    >
                        <Popup>
                            <div>
                                <p>Name: {feature.properties.prop_name}</p>
                                <p>Alarm: {feature.properties.prop_alarm.toString()}</p>
                                {unixTimestampConverter(feature.properties.prop_dt)}
                                <p>Value: {feature.properties.prop_value} nSv/h</p>
                                <hr className='mt-0 mb-1'/>
                                <div className={'d-flex justify-content-end align-items-center'}>
                                    <small>ID: {feature.id}</small>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </>
    )
}

export default MapComponent
