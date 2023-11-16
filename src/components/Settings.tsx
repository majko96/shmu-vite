import React, { useEffect, useState, useCallback } from 'react';
import Modal from "react-modal";
import { useRecoilState } from "recoil";
import { settingsModal, appSettings, station } from "../atoms.ts";
import Select from 'react-select';
import github from '../assets/github.png';
import settingsImg from '../assets/settings.png';

Modal.setAppElement('#root');

const Settings = () => {
    const [modalSettings, setModalSettings] = useRecoilState(settingsModal);
    const [_appSettingsState, setAppSettingsState] = useRecoilState(appSettings);
    const [alarmValue, setAlarmValue] = useState('');
    const [stationId, setStationId] = useState('');
    const storedStationsData = JSON.parse(localStorage.getItem('stations'));
    const [selectedOption, setSelectedOption] = useState(null);
    const [_stationValue, setStationValue] = useRecoilState(station);

    useEffect(() => {
        const storedValue = localStorage.getItem('alarmValue');
        if (storedValue !== null) {
            setAlarmValue(storedValue);
        }
        const stationIdValue = localStorage.getItem('stationIdValue');
        if (stationIdValue !== null) {
            setStationId(stationIdValue)
        }
        const opt = getOptions();
        const option = opt.find((option: any) => option.value == stationIdValue);
        if (option) {
          setSelectedOption(option);
        }
    }, []);

    const handleAlarmValue = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setAlarmValue(inputValue);
    }, []);

    const handleSelectedOption = ((option: any) => {
        if (option === null) {
            setStationId('');
        } else {
            setStationId(option.value);
        }
        setSelectedOption(option);
    });

    function saveAndClose() {
        localStorage.setItem('alarmValue', alarmValue);
        localStorage.setItem('stationIdValue', stationId);
        setStationValue({id: stationId});
        setModalSettings({ state: false });
    }

    function closeModal() {
        console.log(stationId)
        setModalSettings({ state: false });
    }

    const getStyles = () => {
        const customStyles: Modal.Styles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1001,
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
                height: 'auto',
                width: '400px',
                overflow: 'visible'
            },
        };
        return customStyles;
    }

    const saveData = () => {
        setAppSettingsState({alarmValue: alarmValue, stationId: stationId});
        saveAndClose();
    }

    const getOptions = () => {
        if (storedStationsData) {
            const stations = storedStationsData.map((item: any)=> ({ value: item.id, label: item.name }));

            if (stations) {
                return stations;
            }
        }
        
        return [];
    }

    const style = {
        control: (base: any) => ({
          ...base,
          border: 0,
          outline: '1px solid #ced4da !important',
          borderColor: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            outline: '1px solid #aaa !important',
          },
        }),
        option: (styles: any, { isFocused, isSelected }: any) => ({
          ...styles,
          backgroundColor: isSelected ? '#343a40' : isFocused ? 'rgba(0, 0, 0, 0.07)' : undefined,
          '&:active': {
            backgroundColor: '#343a40',
            color: '#fff',
          },
          cursor: isSelected ? 'default' : isFocused ? 'pointer' : undefined,
        }),
      };

    return (
        <>
            <Modal
                isOpen={modalSettings.state}
                onRequestClose={closeModal}
                contentLabel="settings"
                style={getStyles()}
            >
                <button className="btn close-button" onClick={closeModal}>
                    <span>×</span>
                </button>
                <div className='d-flex align-items-center'>
                    <img src={settingsImg} alt="settings" height={'20px'}/>&nbsp;<b>Settings</b>
                </div>
                <div style={{width: "100%", height: "100%"}}>
                    <div className="form-group row align-items-baseline mt-3">
                        <label className="col-sm-3 col-form-label">Alarm</label>
                        <div className="col-sm-9">
                            <input
                                type="number"
                                className={'form-control'}
                                onChange={handleAlarmValue}
                                value={alarmValue}
                            />
                        </div>
                    </div>
                    <div className="form-group row align-items-baseline mt-3">
                        <label className="col-sm-3 col-form-label">Station</label>
                        <div className="col-sm-9">
                            <Select
                                value={selectedOption}
                                onChange={handleSelectedOption}
                                options={getOptions()}
                                isClearable={true}
                                styles={style}
                            />
                        </div>
                    </div>
                    <div className='d-flex justify-content-between align-items-center mt-5'>
                        <a href={'https://github.com/majko96/shmu-vite'} target="_blank" rel="noopener noreferrer" className='btn-link'>
                            <img src={github} alt="github" width={'80px'}/>
                        </a>
                        <button className="btn btn-outline-dark" onClick={saveData}>
                            Save
                        </button>
                    </div>
                    <hr/>
                         <small>
                            The data used in this application is obtained from a non-public API and is exclusively used for educational purposes. 
                            This data is protected by copyright and is the property of the API provider. It is not public data and is not intended
                            for public sharing.
                        </small>
                </div>
            </Modal>
        </>
    );
};

export default Settings;
