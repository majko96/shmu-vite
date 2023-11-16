import {atom, RecoilState} from 'recoil';

export const station: RecoilState<any> = atom({
  key: 'station',
  default: {
    id: null,
    name: null,
  },
});

export const modal= atom({
  key: 'modal',
  default: {
    state: false,
  },
});

export const tableData: RecoilState<any> = atom({
  key: 'data',
  default: {
    values: null,
  },
});

export const settingsModal: RecoilState<any> = atom({
  key: 'settingsModal',
  default: {
    state: false,
  },
});

export const appSettings: RecoilState<any> = atom({
  key: 'appSettings',
  default: {
    alarmValue: null,
    stationId:  null,
    stationName: null
  },
});
