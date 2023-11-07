import 'leaflet/dist/leaflet.css';
import MapComponent from "./assets/MapComponent.tsx";

function App() {

  return (
      // <>
      //     <MapComponent/>
      // </>
      <div className={'container-fluid'}>
          <div className={'row'}>
              <div className={'col-9 p-0'}>
                  <MapComponent/>
              </div>
              <div className={'col-3'}>
                  Details:
              </div>
          </div>
      </div>
  )
}

export default App
