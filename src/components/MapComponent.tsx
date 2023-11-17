import 'leaflet/dist/leaflet.css';
import {CircleMarker, MapContainer, Popup, TileLayer} from 'react-leaflet';
import {LatLng} from 'leaflet';
import axios, {AxiosResponse} from 'axios';
import {useEffect, useRef, useState} from 'react';
import {format} from 'date-fns';
import {useRecoilState} from 'recoil';
import {appSettings, station, tableData, settingsModal} from '../atoms';
import Danger from '../assets/danger.png';
import Check from '../assets/check.png'
import { data } from '../utils/mockData';

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
    const [appSettingsState, _setAppSettingsState] = useRecoilState(appSettings);
    const [forceRerenderKey, setForceRerenderKey] = useState(0);
    const [_modalSettings, setModalSettings] = useRecoilState(settingsModal);

    const getStationDetail = (id: number) => {
        setStationValue((prevState: any) => ({
            ...prevState,
            id: id,
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            let mockValue = false;
            const mock = localStorage.getItem('mock');
                if (mock !== null) {
                    mockValue = JSON.parse(mock);
                }
                if (mockValue) {
                    const mockData = data();
                    setStations(mockData.features);
                    setTableData({values: mockData.features});
                    const stationsData = mockData.features.map((item) => {
                        return { id: item.id, name: item.properties.prop_name };
                    });
                    localStorage.setItem('stations', JSON.stringify(stationsData));
                } else {
                    try {
                        const response: AxiosResponse<RadiationData> = await axios.get<RadiationData>(
                            'https://w5.shmu.sk/api/v1/meteo/getradiationgeojson',
                            {timeout: 10000}
                            );
                        setStations(response.data.features);
                        setTableData({values: response.data.features});
                        const stationsData = response.data.features.map((item) => {
                            return { id: item.id, name: item.properties.prop_name };
                          });
                        localStorage.setItem('stations', JSON.stringify(stationsData));
                    } catch (error) {
                        console.log('Sorry, something went wrong...')
                        setHasError(true);
                    }
                }
        };
        fetchData().then();
    }, [setTableData, forceRerenderKey]);

    useEffect(() => {
        const markerRef = markerRefs.current[stationValue.id];
        if (markerRef) {
            markerRef.openPopup();
        } else {
            if (markerRefs.current) {
                for (const key in markerRefs.current) {
                    if (Object.prototype.hasOwnProperty.call(markerRefs.current, key)) {
                      const markerReference = markerRefs.current[key];
                      if (markerReference) {
                          markerReference.closePopup();
                      }
                    }
                  }
              }
        }
    })

    useEffect(() => {
        const savedStationId = localStorage.getItem('stationIdValue');
        if (savedStationId) {
            setStationValue({id: savedStationId});
        }
    }, []);

    useEffect(() => {
        if (appSettingsState.alarmValue !== undefined) {
            setForceRerenderKey((prev) => prev + 1);
        }
    }, [appSettingsState]);

    const unixTimestampConverter = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const timeZoneOffset = 1;
        const adjustedDate = new Date(date.setHours(date.getHours() + timeZoneOffset));
        return format(adjustedDate, 'dd.MM.yyyy HH:mm');
    };

    const openSettingsModal = () => {
        setModalSettings({state: true})
    }

    if (hasError) {
        return (
            <div className={'e-message'}>
                Sorry, something went wrong, you can use mock
                data for example how application work. You can set it in settings.
                <div className='mt-3'>
                    <button 
                        className='btn btn-dark'
                        onClick={openSettingsModal}
                    >
                        Settings
                    </button>
                </div>
             </div>
        )
    }

    if (stations === null) {
        return (
            <div className={'loader'}></div>
        )
    }

    const handleMarkerClick = (id: number) => {
        setStationValue({id: id});
        if (stationValue.id) {
            getStationDetail(id);
        } else {
            handleMarkerPopupClose;
        }
    }

    const handleMarkerPopupClose = () => {
        setStationValue({id: null, name: null});
    }

    const renderStatusIcon = (alarm: boolean, value: number) => {
        if (localStorage.getItem('alarmValue')) {
            if (value > parseInt(localStorage.getItem('alarmValue'), 10)) {
                return (
                    <img
                        src={Danger}
                        alt={'danger'}
                        width={'17px'}
                        height={'17px'}
                        className={'alarm-icon'}
                    >
                    </img>
                );
            }
            return (
                <img
                    src={Check}
                    alt={'check'}
                    width={'20px'}
                    height={'20px'}
                    className={'alarm-icon'}
                >
                </img>
            );
        }
        if (alarm) {
            return (
                <img
                    src={Danger}
                    alt={'danger'}
                    width={'17px'}
                    height={'17px'}
                    className={'alarm-icon'}
                >
                </img>
            );
        }
        return (
            <img
                src={Check}
                alt={'check'}
                width={'20px'}
                height={'20px'}
                className={'alarm-icon'}
            >
            </img>
        );
    }

    const getMarkerColor = (alarm: boolean, value: number) => {
        if (localStorage.getItem('alarmValue')) {
            if (value > parseInt(localStorage.getItem('alarmValue'), 10)) {
                return 'red';
            }
            return 'green';
        }
        if (alarm) {
            return 'red';
        }
        return 'green';
    }

    return (
        <>
            <MapContainer
                center={position}
                zoom={8}
                scrollWheelZoom={true}
                key={forceRerenderKey}
            >
                <TileLayer
                    attribution="Google Maps"
                    url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                />
                {stations.map((feature: Feature) => (
                    <CircleMarker
                        key={feature.id}
                        center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                        fillColor={getMarkerColor(feature.properties.prop_alarm, feature.properties.prop_value)}
                        color={'#000'}
                        fillOpacity={100}
                        weight={1}
                        eventHandlers={{
                            click: () => {
                                handleMarkerClick(feature.id);
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
                                <div className={'mt-1 mb-1 d-flex align-items-center justify-content-between'}>
                                    <span>
                                        <b>{feature.properties.prop_value}</b>&nbsp;nSv/h
                                    </span>
                                    <span>
                                        {renderStatusIcon(feature.properties.prop_alarm, feature.properties.prop_value)}
                                    </span>
                                </div>
                                <hr className='mt-1 mb-1'/>
                                <div className={'d-flex justify-content-end align-items-center'}>
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
