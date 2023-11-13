import 'leaflet/dist/leaflet.css';
import MapComponent from './components/MapComponent.tsx';
import Detail from './components/Detail.tsx';
import Table from "./components/Table.tsx";
import {useRecoilState} from "recoil";
import {modal, station} from "./atoms.ts";
import Navbar from "./components/Navbar.tsx";

function App() {
    const [isOpenModal, setIsOpenModal] = useRecoilState(modal);
    const [_station, setStation] = useRecoilState(station);

    const showTable = () => {
        setIsOpenModal({state: !isOpenModal.state})
        setStation({id: null, name: null});
    }

    return (
        <div>
            <Navbar></Navbar>
            <MapComponent/>
            <Detail/>
            { isOpenModal &&
                <Table/>
            }
            <div className="sticky-button">
                <button
                    className='btn btn-menu p-3'
                    onClick={showTable}
                >
                </button>
            </div>
        </div>

    )
}

export default App
