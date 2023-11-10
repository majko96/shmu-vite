import 'leaflet/dist/leaflet.css';
import MapComponent from './components/MapComponent.tsx';
import Detail from './components/Detail.tsx';
import Table from "./components/Table.tsx";
import {useRecoilState} from "recoil";
import {modal, station} from "./atoms.ts";

function App() {
    const [isOpenModal, setIsOpenModal] = useRecoilState(modal);
    const [_station, setStation] = useRecoilState(station);

    const showTable = () => {
        setIsOpenModal({state: !isOpenModal.state})
        setStation({id: null, name: null});
    }

    return (
        <div>
            <MapComponent/>
            <Detail/>
            { isOpenModal &&
                <Table/>
            }
            <div className="sticky-button">
                <button
                    className='btn btn-secondary'
                    onClick={showTable}
                >
                    Show all
                </button>
            </div>
        </div>

    )
}

export default App
