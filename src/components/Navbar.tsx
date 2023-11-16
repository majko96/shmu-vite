import logoImage from '../assets/danger-logo.png';
import cogImage from '../assets/cog-white.png'
import {useRecoilState} from "recoil";
import {settingsModal} from "../atoms.ts";
const Navbar = () => {
    const [appSettings, setAppSettings] = useRecoilState(settingsModal);
    const openSettings = () => {
        setAppSettings({state: !appSettings.state})
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
            <div className="d-flex w-100 justify-content-between align-items-center">
                <a className="navbar-brand font-weight-bold justify-center align-items-center" href="/">
                    <img src={logoImage} alt="logo" width="30" height="30" className="d-inline-block align-top mr-2"/>
                    RADIATION MAP
                </a>
                <div>
                    <button className={'btn-cog'} onClick={openSettings}>
                        <img src={cogImage} alt="settings" width="30" height="30"
                             className="d-inline-block align-top mr-2 cog-icon"
                        />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
