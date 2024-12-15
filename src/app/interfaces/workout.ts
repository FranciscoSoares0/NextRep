import { IExercise } from "./exercise";

export interface IWorkout{
    id : string;
    nome:string;
    cor:string;
    exercicios : Array<IExercise>;
}