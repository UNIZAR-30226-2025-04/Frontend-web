import type { Voucher, Joker, JokerEdition, Overlay, Suit } from "./interfaces";

// Regular cards

// Function to get numerical value from a rank string
export function getValueFromRank(rank:string):number{
    switch(rank){
        case "A": return 14;
        case "K": return 13;
        case "Q": return 12;
        case "J": return 11;
        default:
            return Number(rank);
    }
}

export function getValueFromSuit(suitName: string): number {
	const index = suitDirectory.findIndex(suit => suit.name === suitName);
	if (index === -1) return 0;
	return index;
}


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
    {name:"Average size Michael",image:"cards/jokers/AVERAGE_SIZE_MICHAEL.png",tooltip:"+15 mult, 1/15 chance of being sold each round"},
    {name:"Wheel of fortune", image:"cards/bouchers/wheel_of_fortune.png",tooltip:"It's just wheel of fortune, it looses money"},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"}

]

export const jokerEditionsDirectory:JokerEdition[] = [
    {name:"None",image:"",tooltip:""},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"}
]

// Vouchers

export const errorVoucher:Voucher = {
    name:"Error boucher", image:"icons/missing.png",tooltip:"Error boucher"
}

export const voucherDirectory:Voucher[] = [
    {name:"Wheel of fortune", image:"cards/bouchers/wheel_of_fortune.png",tooltip:"It's just wheel of fortune, it looses money"},
    {name:"Average size Michael",image:"cards/jokers/AVERAGE_SIZE_MICHAEL.png",tooltip:"+15 mult, 1/15 chance of being sold each round"},
]