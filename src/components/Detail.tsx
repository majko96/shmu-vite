import 'leaflet/dist/leaflet.css';
import {useRecoilState} from 'recoil';
import {station} from '../atoms';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {addDays, format, subMonths} from 'date-fns';
import Modal from 'react-modal';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    const [searchStartDate, setSearchStartDate] = useState<Date | null>(null);
    const [searchEndDate, setSearchEndDate] = useState<Date | null>(null);
    const [filteredDetail, setFilteredDetail]: any = useState(null);

    const handleSearchStartDateChange = (date: Date | null) => {
        setSearchStartDate(date);
    };

    const handleSearchEndDateChange = (date: Date | null) => {
        setSearchEndDate(date);
    };

    const handleSearch = () => {
        setFilteredDetail(null);
        if (searchStartDate !== null && searchEndDate !== null) {
            const endDate = new Date(searchEndDate);
            endDate.setHours(23, 59, 59);

            const filteredData = detail.filter((item: DetailItem) => {
                const date = new Date(item.dt * 1000);
                const timeZoneOffset = 1;
                const itemDate = new Date(date.setHours(date.getHours() + timeZoneOffset));

                return itemDate >= searchStartDate && itemDate <= endDate;
            });
            setFilteredDetail(filteredData.slice().sort((a: DetailItem, b: DetailItem) => b.dt - a.dt));
        }
        if (searchStartDate !== null) {
            const endDate = new Date();
            endDate.setHours(23, 59, 59);

            const filteredData = detail.filter((item: DetailItem) => {
                const date = new Date(item.dt * 1000);
                const timeZoneOffset = 1;
                const itemDate = new Date(date.setHours(date.getHours() + timeZoneOffset));

                return itemDate >= searchStartDate && itemDate <= endDate;
            });
            setFilteredDetail(filteredData.slice().sort((a: DetailItem, b: DetailItem) => b.dt - a.dt));
        }
        if (searchEndDate !== null) {
            const endDate = new Date(searchEndDate);
            endDate.setHours(23, 59, 59);

            const filteredData = detail.filter((item: DetailItem) => {
                const date = new Date(item.dt * 1000);
                const timeZoneOffset = 1;
                const itemDate = new Date(date.setHours(date.getHours() + timeZoneOffset));

                return itemDate >= searchStartDate && itemDate <= endDate;
            });
            setFilteredDetail(filteredData.slice().sort((a: DetailItem, b: DetailItem) => b.dt - a.dt));
        }
    };

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
                    console.log('Sorry, something went wrong...')
                }
            };
            fetchData().then();
        }
    }, [stationValue]);

    useEffect(() => {
        handleSearch();
        if (searchStartDate === null && searchEndDate === null) {
            setFilteredDetail(null);
        }
    }, [searchStartDate, searchEndDate])

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

    const getChartData = () => {
        if (filteredDetail) {
            const filteredSortedData : DetailItem[] =
                filteredDetail.slice().sort((a: DetailItem, b: DetailItem) => a.dt - b.dt);
            return filteredSortedData.map((item: DetailItem) => {
                return {
                    value: item.value,
                    dt: unixTimestampConverter(item.dt),
                };
            });
        }
        return modifiedDataForChart;
    }

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
                    <p className='ml-5'>{stationValue.name}</p>
                </div>
                <div style={{ width: "100%", height: "100%" }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={getChartData()}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 50
                            }}
                        >
                            <ReferenceLine
                                y={400}
                                stroke="red"
                                label={{ value: 'Alarm', position: 'insideTopLeft', dy: -20 }}
                            />
                            <CartesianGrid />
                            <XAxis
                                dataKey="dt"
                                tick={{ fontSize: 12 }}
                                tickFormatter={stringToDateConverter}
                                interval={window.innerWidth <= 500 ? 200 : 50} 
                            />
                            <YAxis
                                domain={[0, 550]}
                                ticks={[40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560]}
                            />
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

    const renderTableBody = () => {
        if (filteredDetail) {
            return (
                filteredDetail.map((item: DetailItem, index: number) => (
                        <tr key={index}>
                            <td>{unixTimestampConverter(item.dt)}</td>
                            <td>{item.value} nSv/h</td>
                        </tr>
                    ))
            )
        }
        return (
            sortedData.map((item: DetailItem, index: number) => (
                    <tr key={index}>
                        <td>{unixTimestampConverter(item.dt)}</td>
                        <td>{item.value} nSv/h</td>
                    </tr>
                ))
        )
    }

    const getMinDateTo = () => {
        return searchStartDate !== null ? searchStartDate : addDays(subMonths(new Date(), 1), 1);
    }

    const getMaxDate = () => {
        return searchEndDate !== null ? searchEndDate : new Date();
    };

    return (
        <div className={'card data-box'}>
            <button onClick={closeDetailWindow} className="btn close-button">
                <span>×</span>
            </button>
            <p>
                {stationValue.name}
            </p>
            <div className={'d-flex justify-content-between gap-10 mb-3'}>
                <div>
                    <DatePicker
                        selected={searchStartDate}
                        onChange={(date) => handleSearchStartDateChange(date)}
                        isClearable
                        placeholderText="From"
                        className={'form-control'}
                        minDate={addDays(subMonths(new Date(), 1), 1)}
                        maxDate={getMaxDate()}
                    />
                </div>
                <div>
                    <DatePicker
                        selected={searchEndDate}
                        onChange={(date) => handleSearchEndDateChange(date)}
                        isClearable
                        placeholderText="To"
                        className={'form-control'}
                        minDate={getMinDateTo()}
                        maxDate={new Date()}
                    />
                </div>
            </div>
            <div className={'data-box-table'}>
                <table className="table table-striped table-bordered">
                    <thead className={'sticky-top bg-dark text-white'}>
                    <tr>
                        <th>Date</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                        {renderTableBody()}
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
