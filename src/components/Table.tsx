import Modal from "react-modal";
import {useRecoilState} from "recoil";
import {modal, station, tableData} from "../atoms.ts";
import {format} from "date-fns";

Modal.setAppElement('#root');

function Table() {
    const [isOpenModal, setIsOpenModal] = useRecoilState(modal);
    const [data, _setData] = useRecoilState(tableData);
    const [_stationValue, setStationValue] = useRecoilState(station);


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
                padding: '30px 5px',
            },
        };
        if (window.innerWidth <= 900) {
            return mobileStyles;
        } else {
            return customStyles;
        }
    }

    

    const closeModal = () => {
        setIsOpenModal({state: false});
    }

    const unixTimestampConverter = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const timeZoneOffset = 1;
        const adjustedDate = new Date(date.setHours(date.getHours() + timeZoneOffset));
        return format(adjustedDate, 'dd.MM.yyyy HH:mm');
    };

    if (data.values === null) {
        return (
            <div className={'card data-box'}>
                <div className='loader'></div>
            </div>
        )
    }

    const redirectToStation = (id: any, name: string) => {
        setIsOpenModal({state: false})
        setStationValue((prevState: any) => ({
            ...prevState,
            id: id,
            name: name,
        }));
    }

    return (
        <>
            <Modal
                isOpen={isOpenModal.state}
                onRequestClose={closeModal}
                contentLabel="table"
                style={getStyles()}
            >
                <>
                    <button onClick={closeModal} className="btn close-button">
                        <span>×</span>
                    </button>
                    <div style={{ maxHeight: "100%", overflowY: "auto" }} className={'m-3'}>
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Station</th>
                                    <th>Date</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                            {data.values.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td className={'align-middle'}>
                                        <button
                                            className={'btn btn-link text-left'}
                                            onClick={() => {redirectToStation(item.id, item.properties.prop_name)}}
                                        >
                                            {item.properties.prop_name}
                                        </button>
                                    </td>
                                    <td>{unixTimestampConverter(item.properties.prop_dt)}</td>
                                    <td>{item.properties.prop_value} nSv/h</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            </Modal>
        </>
    );
}

export default Table;
