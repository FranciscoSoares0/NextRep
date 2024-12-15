
import { Timestamp } from "firebase/firestore";

export interface IExerciseUpdate{
    id : string;
    exerciseid:string;
    series:number;
    repeticoes:number;
    peso:number;
    created: Timestamp;
}