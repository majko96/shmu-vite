import 'leaflet/dist/leaflet.css';
import MapComponent from './components/MapComponent.tsx';
import Detail from './components/Detail.tsx';

function App() {
  const showTable = () => {

  }
  return (
        <div>
            <MapComponent/>
            <Detail/>
            <div className="sticky-button">
              <button 
                className='btn btn-secondary'
                onClick={showTable}
                >
                  Show table
              </button>
            </div>
        </div>

  )
}

export default App
