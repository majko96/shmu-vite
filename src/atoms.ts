import {atom, RecoilState} from 'recoil';

export const station: RecoilState<any> = atom({
  key: 'station',
  default: {
    id: null,
    name: null,
  },
});

export const modal = atom({
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
