import 'leaflet/dist/leaflet.css';
import { useRecoilState } from 'recoil';
import { station } from '../atoms';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { format } from 'date-fns';

interface DetailItem {
    dt: number;
    value: number;
  }

function Detail() {
    const [stationValue] = useRecoilState(station);
    const [detail, setDetail]:any = useState(null);


    useEffect(() => {
        if (stationValue) {
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
        const formattedDateTime = format(date, "dd.MM.yyyy HH:mm");
        
        return formattedDateTime;
    };


    if (detail === null || detail === undefined) {
        return;
    }

    const sortedData : DetailItem[] = detail.slice().sort((a: DetailItem, b: DetailItem) => b.dt - a.dt);

    const closeDetail = () => {
        setDetail(null);
    }

    return (
        <div className={'card data-box'}>
            <button onClick={closeDetail}>Close</button>
            <h4>History data</h4>
            {stationValue.id}
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
                        {sortedData.map((item: any, index: number) => (
                            <tr key={index}>
                                <td>{unixTimestampConverter(item.dt)}</td>
                                <td>{item.value} nSv/h</td>
                            </tr>
                        ))}
                        </tbody>
                </table>
                </div>
            </div>
    )
}

export default Detail
