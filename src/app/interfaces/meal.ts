
export interface IMeal{
    id? : string;
    categoria: string;
    product_name:string;
    quantidade:number;
    calorias:number;
    proteinas:number;
    gorduras:number;
    hidratos:number;
    barcode:string;
    nutriments? : {
        proteins_100g:number;
        fat_100g:number;
        carbohydrates_100g:number;
    }
}