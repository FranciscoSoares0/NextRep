import { Timestamp } from "firebase/firestore";

export interface ICardio{
    id : string;
    nome:string;
    minutos:number;
    calorias:number;
    nota?:string;
    created : Timestamp
}