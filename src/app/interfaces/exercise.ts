import { Timestamp } from "firebase/firestore";

export interface IExercise{
    id : string;
    nome:string;
    series:number;
    repeticoes:number;
    pesoAtual:number;
    nota?:string;
    created : Timestamp
}