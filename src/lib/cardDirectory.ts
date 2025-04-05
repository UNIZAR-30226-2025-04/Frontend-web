import type { Boucher, Joker, JokerEdition, Overlay, Suit } from "./interfaces";

// Regular cards

// Names and links of all the possible suits of cards
export const suitDirectory:Suit[] = [
    {name:"h",color:0,image:"cards/suits/h.png"},
    {name:"s",color:1,image:"cards/suits/s.png"},
    {name:"d",color:0,image:"cards/suits/d.png"},
    {name:"t",color:1,image:"cards/suits/t.png"},
];

// Color of text of a suit
export const suitColorDirectory:string[] = [
    "text-red-500",
    "text-black"
]

// Overlays for regular cards
export const overlayDirectory:Overlay[] = [
    {name:"None",image:"",tooltip:""},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"}
]

// Jokers

export const errorJoker:Joker = {
    name:"Error joker", image:"icons/missing.png",tooltip:"This is an error"
}

export const jokerDirectory:Joker[] = [
    {name:"Average size Michael",image:"cards/jokers/AVERAGE_SIZE_MICHAEL.png",tooltip:"+15 mult, 1/15 chance of being sold each round"}
]

export const jokerEditionsDirectory:JokerEdition[] = [
    {name:"None",image:"",tooltip:""},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"}
]

// Bouchers

export const errorBoucher:Boucher = {
    name:"Error boucher", image:"icons/missing.png",tooltip:"Error boucher"
}

export const boucherDirectory:Boucher[] = [
    {name:"Wheel of fortune", image:"cards/bouchers/wheel_of_fortune.png",tooltip:"It's just wheel of fortune, it looses money"},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"},
    {name:"Average size Michael",image:"cards/jokers/AVERAGE_SIZE_MICHAEL.png",tooltip:"+15 mult, 1/15 chance of being sold each round"},
    {name:"Error boucher", image:"icons/missing.png",tooltip:"Error boucher"}



]