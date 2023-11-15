import 'leaflet/dist/leaflet.css';
import {useRecoilState} from 'recoil';
import {station} from '../atoms';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {format} from 'date-fns';
import Modal from 'react-modal';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend, 
    ResponsiveContainer, 
    ReferenceLine
} from "recharts";

Modal.setAppElement('#root');

interface DetailItem {
    dt: number;
    value: number;
}
type CloseModalFunction = () => void;

function Detail() {
    const [stationValue] = useRecoilState(station);
    const [detail, setDetail]: any = useState(null);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [closeDetail, setCloseDetail] = useState(true);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    const getStyles = () => {
        const customStyles: Modal.Styles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
            },
            content: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                height: '80%',
                width: '80%',
                overflow: 'hidden'
            },
        };

        const mobileStyles: Modal.Styles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
            },
            content: {
                position: 'absolute',
                top: 'auto',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                height: '80%',
                width: '100%',
                overflow: 'hidden',
                bottom: 0,
                padding: '30px 20px 0 0',
            },
        };
        if (window.innerWidth <= 900) {
            return mobileStyles;
        } else {
            return customStyles;
        }
    }

    useEffect(() => {
        if (stationValue.id !== null) {
            setCloseDetail(false);
            setIsLoading(true);
            const fetchData = async () => {
                try {
                    const response = await axios.get(
                        `https://w5.shmu.sk/api/v1/meteo/getradiationdata?station=${stationValue.id}&history=720`);
                    setDetail(response.data.data);
                    setIsLoading(false);
                } catch (error) {
                    setIsLoading(false);
                    console.log('something went wrong...')
                }
            };
            fetchData().then();
        }
    }, [stationValue]);

    const unixTimestampConverter = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const timeZoneOffset = 1;
        const adjustedDate = new Date(date.setHours(date.getHours() + timeZoneOffset));
        return format(adjustedDate, 'dd.MM.yyyy HH:mm');
    };

    const stringToDateConverter = (datetime: string) => {
        return datetime.split(" ")[0];
    };

    if (closeDetail || detail === null || detail === undefined || stationValue.id === null) {
        return;
    }

    if (isLoading) {
        return (
            <div className={'card data-box'}>
                <div className='loader'></div>
            </div>
        )
    }

    const sortedData : DetailItem[] = detail.slice().sort((a: DetailItem, b: DetailItem) => b.dt - a.dt);
    const modifiedDataForChart = detail.map((item: DetailItem) => {
        return {
          value: item.value,
          dt: unixTimestampConverter(item.dt),
        };
      });

    const CustomTooltip: React.FC<any> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0];
            return (
                <div className={'card p-3'}>
                    <div>
                        {`${dataPoint.payload.dt}`}
                    </div>
                    <div>
                        {`${dataPoint.value} nSv/h`}
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomModal = ({isOpen, closeModal}: { isOpen: boolean; closeModal: CloseModalFunction }) => {
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="chart"
                style={getStyles()}
            >
                <button onClick={closeModal} className="btn close-button">
                    <span>×</span>
                </button>
                <div>
                    <h2 className='ml-5'>{stationValue.name}</h2>
                </div>
                <div style={{ width: "100%", height: "100%" }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={modifiedDataForChart}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 50
                            }}
                        >
                            <ReferenceLine y={400} stroke="red" label={{ value: 'Alarm', position: 'insideTopLeft', dy: -20 }} />
                            <CartesianGrid />
                            <XAxis
                                dataKey="dt"
                                tick={{ fontSize: 12 }}
                                tickFormatter={stringToDateConverter}
                                interval={window.innerWidth <= 500 ? 200 : 50} 
                            />
                            <YAxis domain={[0, 550]} ticks={[40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560]}/>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Modal>
        );
    };

    const closeDetailWindow = () => {
        setCloseDetail(true);
        setDetail(null);
    }

    return (
        <div className={'card data-box'}>
            <button onClick={closeDetailWindow} className="btn close-button">
                <span>×</span>
            </button>
            <p>
                {stationValue.name}
            </p>
            <div className={'data-box-table'}>
                <table className="table table-striped table-bordered">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedData.map((item: DetailItem, index: number) => (
                        <tr key={index}>
                            <td>{unixTimestampConverter(item.dt)}</td>
                            <td>{item.value} nSv/h</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className={'d-flex justify-content-between pt-2'}>
                <small>[ID: {stationValue.id}]</small>
                <small>
                    <button className="btn btn-link p-0" onClick={openModal}>Chart</button>
                </small>
            </div>
            <div>
                <CustomModal isOpen={modalIsOpen} closeModal={closeModal}/>
            </div>
        </div>
    )
}

export default Detail
