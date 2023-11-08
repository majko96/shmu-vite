import 'leaflet/dist/leaflet.css';
import {useRecoilState} from 'recoil';
import {station} from '../atoms';
import axios from 'axios';
import {useEffect, useState} from 'react';
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

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

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

    useEffect(() => {
        if (stationValue.id !== null) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(
                        `https://w5.shmu.sk/api/v1/meteo/getradiationdata?station=${stationValue.id}&history=720`);
                    setDetail(response.data.data);
                } catch (error) {
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


    if (detail === null || detail === undefined) {
        return;
    }

    const sortedData : DetailItem[] = detail.slice().sort((a: DetailItem, b: DetailItem) => b.dt - a.dt);
    const modifiedDataForChart = detail.map((item: DetailItem) => {
        return {
          value: item.value,
          dt: unixTimestampConverter(item.dt),
        };
      });

    const CustomModal = ({ isOpen, closeModal }: { isOpen: boolean; closeModal: CloseModalFunction }) => {
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="chart"
                style={customStyles}
            >
                <button onClick={closeModal} className="btn close-button">
                    <span>×</span>
                </button>
                <h2>{stationValue.name}</h2>
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
                                interval={50} 
                            />
                            <YAxis domain={[0, 550]} ticks={[40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560]} />
                            <Tooltip/>
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

    const closeDetail = () => {
        setDetail(null);
    }

    return (
        <div className={'card data-box'}>
            <button onClick={closeDetail} className="btn close-button">
                <span>×</span>
            </button>
            <p>
                {stationValue.name}
            </p>
            <div className={'data-box-table'}>
                <table className="table">
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
                    <button className="btn btn-link p-0" onClick={openModal}>Show more</button>
                </small>
            </div>
            <div>
                <CustomModal isOpen={modalIsOpen} closeModal={closeModal}/>
            </div>
        </div>
    )
}

export default Detail
