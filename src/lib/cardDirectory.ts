import type { Suit } from "./interfaces";

// Names and links of all the possible suits of cards
export const suitDirectory:Suit[] = [
    {name:"h",color:0,image:"cards/suits/h.png"},
    {name:"s",color:1,image:"cards/suits/s.png"},
    {name:"d",color:0,image:"cards/suits/d.png"},
    {name:"t",color:1,image:"cards/suits/t.png"},
];


export const suitColorDirectory:string[] = [
    "text-red-500",
    "text-black"
]