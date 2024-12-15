import { Timestamp } from 'firebase/firestore';

export interface IUpdate {
  novoPeso: number;
  torax: number;
  cintura: number;
  quadril: number;
  coxa: number;
  braco: number;
  id: string;
  created: Timestamp;
}
