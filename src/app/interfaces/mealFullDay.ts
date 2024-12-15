import { Timestamp } from "firebase/firestore";
import { IMeal } from "./meal";

export interface IMealFullDay{
    data : Timestamp;
    id : string;
    meals: Array<IMeal>;
}