import logoImage from '../assets/logo.png';
const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
            <div className={''}>
                <a className="navbar-brand font-weight-bold justify-center align-items-center" href="/">
                    <img src={logoImage} alt="Logo" width="30" height="30" className="d-inline-block align-top mr-2"/>
                    Radiation-map
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
