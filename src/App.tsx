import 'leaflet/dist/leaflet.css';
import MapComponent from './components/MapComponent.tsx';
import Detail from './components/Detail.tsx';

function App() {
  return (
      // <>
      //     <MapComponent/>
      // </>

        <div className={''}>
            <MapComponent/>
            <Detail/>
        </div>

  )
}

export default App
