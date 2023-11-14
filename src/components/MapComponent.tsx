import 'leaflet/dist/leaflet.css';
import {CircleMarker, MapContainer, Popup, TileLayer} from 'react-leaflet';
import {LatLng} from 'leaflet';
import axios, {AxiosResponse} from 'axios';
import {useEffect, useRef, useState} from 'react';
import {format} from 'date-fns';
import {useRecoilState} from 'recoil';
import {station, tableData} from '../atoms';
import Danger from '../assets/danger.png';
import Check from '../assets/check.png'

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
        } else {
            if (markerRefs.current) {
                for (const key in markerRefs.current) {
                    if (Object.prototype.hasOwnProperty.call(markerRefs.current, key)) {
                      const markerReference = markerRefs.current[key];
                      markerReference.closePopup();
                    }
                  }
              }
        }
    })

    const unixTimestampConverter = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const timeZoneOffset = 1;
        const adjustedDate = new Date(date.setHours(date.getHours() + timeZoneOffset));
        return format(adjustedDate, 'dd.MM.yyyy HH:mm');
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
        setStationValue({id: id, name: name});
        if (stationValue.id) {
            getStationDetail(id, name);
        } else {
            handleMarkerPopupClose;
        }
    }

    const handleMarkerPopupClose = () => {
        setStationValue({id: null, name: null});
    }

    const renderStatusIcon = (alarm: boolean) => {
        if (alarm) {
            return (
                <img src={Danger} alt={'danger'} width={'20px'} height={'20px'}></img>
            )
        }
        return (
            <img src={Check} alt={'danger'} width={'20px'} height={'20px'}></img>
        )
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
                        }}
                        ref={(ref) => (markerRefs.current[feature.id] = ref)}
                    >
                        <Popup>
                            <div className={'text-left'}>
                                <div>
                                    <b>{feature.properties.prop_name}</b>
                                </div>
                                <div className={'mt-1'}>
                                    {unixTimestampConverter(feature.properties.prop_dt)}
                                </div>
                                <div className={'mt-1 mb-1'}>
                                    {feature.properties.prop_value} nSv/h
                                </div>
                                <hr className='mt-1 mb-1'/>
                                <div className={'d-flex justify-content-between align-items-center'}>
                                    <div>
                                        {renderStatusIcon(feature.properties.prop_alarm)}
                                    </div>
                                    <small>[ID: {feature.id}]</small>
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
