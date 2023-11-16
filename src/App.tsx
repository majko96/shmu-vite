import 'leaflet/dist/leaflet.css';
import MapComponent from './components/MapComponent.tsx';
import Detail from './components/Detail.tsx';
import Table from "./components/Table.tsx";
import {useRecoilState} from "recoil";
import {modal, station, tableData} from "./atoms.ts";
import Navbar from "./components/Navbar.tsx";
import Settings from "./components/Settings.tsx";

function App() {
    const [isOpenModal, setIsOpenModal] = useRecoilState(modal);
    const [_station, setStation] = useRecoilState(station);
    const [data, _setData] = useRecoilState(tableData);

    const showTable = () => {
        setIsOpenModal({state: !isOpenModal.state})
        setStation({id: null, name: null});
    }

    return (
        <div>
            <Navbar/>
            <MapComponent/>
            <Detail/>
            {isOpenModal &&
                <Table/>
            }
            {data &&
                <div className="sticky-button">
                    <button
                        className='btn btn-menu p-3'
                        onClick={showTable}
                    >
                    </button>
                </div>
            }
            <Settings/>
        </div>

    )
}

export default App
