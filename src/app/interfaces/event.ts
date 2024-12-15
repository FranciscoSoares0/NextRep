import { Timestamp } from "firebase/firestore";

export interface IEvent{
    id? : string;
    nome:string;
    start:{
        seconds:number;
    };
    end:{
        seconds:number;
    };
    workoutid : string;
    cor:string;
}