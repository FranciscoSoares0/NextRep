import { Timestamp } from "firebase/firestore";
export interface IUser{
    uid:string;
    email: string;
    password?: string;
    nome: string;
    apelido: string;
    altura:number;
    peso:number;
    objetivo:number;
    sexo:string;
    dataNascimento:Timestamp;
    torax:number;
    quadril:number;
    cintura:number;
    braco:number;
    coxa:number;
    atividade:string;
    calorias:number;
    proteinas:number;
    gorduras:number;
    hidratos:number;
    agua:number;
    cor:string;
    lastLoginDate:Timestamp;
    consecutiveDays:number;
    photoURL?:string;
}