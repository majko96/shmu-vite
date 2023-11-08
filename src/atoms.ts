import { atom } from 'recoil';

export const station = atom({
  key: 'station',
  default: {
    id: null,
    name: null,
  },
});