import React, { useEffect, useState, useCallback } from 'react';
import Modal from "react-modal";
import { useRecoilState } from "recoil";
import { settingsModal, appSettings } from "../atoms.ts";

Modal.setAppElement('#root');

const Settings = () => {
    const [modalSettings, setModalSettings] = useRecoilState(settingsModal);
    const [_appSettingsState, setAppSettingsState] = useRecoilState(appSettings);
    const [alarmValue, setAlarmValue] = useState('');
    const [stationId, setStationId] = useState('');

    useEffect(() => {
        const storedValue = localStorage.getItem('alarmValue');
        if (storedValue !== null) {
            setAlarmValue(storedValue);
        }
        const stationIdValue = localStorage.getItem('stationIdValue');
        if (stationIdValue !== null) {
            setStationId(stationIdValue)
        }
    }, []);

    const handleAlarmValue = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setAlarmValue(inputValue);
    }, []);

    const handleStationId = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setStationId(inputValue);
    }, []);

    function closeModal() {
        setModalSettings({ state: false });
        localStorage.setItem('alarmValue', alarmValue);
        localStorage.setItem('stationIdValue', stationId);
        localStorage.setItem('stationNameValue', 'zilina');
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
                width: '300px',
                overflow: 'hidden'
            },
        };
        return customStyles;
    }

    const saveData = () => {
        setAppSettingsState({alarmValue: alarmValue, stationId: stationId});
        closeModal();
    }

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
                <b>Settings</b>
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
                            <input
                                type="number"
                                className={'form-control'}
                                onChange={handleStationId}
                                value={stationId}
                            />
                        </div>
                    </div>
                    <div className={'text-center'}>
                        <button className="btn btn-outline-dark mt-4" onClick={saveData}>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Settings;
