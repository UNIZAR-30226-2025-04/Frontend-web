import type { Voucher, Joker, JokerEdition, Overlay, Suit, HandType, Package } from "./interfaces";

// Regular cards

// Function to get numerical value from a rank string
export function getValueFromRank(rank:string):number{
    switch(rank){
        case "A": return 10;
        case "K": return 10;
        case "Q": return 10;
        case "J": return 10;
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
    {name:"c",color:1,image:"cards/suits/t.png"},
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

// Base scores for diferent hands
export const HandTypesBase:HandType[] = [
    {name:"Flush five",lvl:1,baseBlue:160,baseRed:16},
    {name:"Flush house",lvl:1,baseBlue:140,baseRed:14},
    {name:"Five of a kind",lvl:1,baseBlue:120,baseRed:12},
    {name:"Royal flush",lvl:1,baseBlue:100,baseRed:8},
    {name:"Straight flush",lvl:1,baseBlue:100,baseRed:8},
    {name:"Four of a kind",lvl:1,baseBlue:60,baseRed:7},
    {name:"Full house",lvl:1,baseBlue:40,baseRed:4},
    {name:"Flush",lvl:1,baseBlue:35,baseRed:4},
    {name:"Straight",lvl:1,baseBlue:30,baseRed:4},
    {name:"Three of a kind",lvl:1,baseBlue:30,baseRed:3},
    {name:"Two pair",lvl:1,baseBlue:20,baseRed:2},
    {name:"One pair",lvl:1,baseBlue:10,baseRed:2},
    {name:"High card",lvl:1,baseBlue:5,baseRed:1},
]

// Jokers

export const errorJoker:Joker = {
    name:"Error joker", image:"icons/missing.png",tooltip:"This is an error"
}

export const jokerDirectory:Joker[] = [
    {name:"Average size Michael",image:"cards/jokers/AVERAGE_SIZE_MICHAEL.png",tooltip:"+15 mult, 1/15 chance of being sold each round"},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"}
]

export const jokerEditionsDirectory:JokerEdition[] = [
    {name:"None",image:"",tooltip:""},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"}
]

// Vouchers

export const errorVoucher:Voucher = {
    name:"Error boucher", image:"icons/missing.png",tooltip:"Error boucher",targetType:true,targetCount:1
}

export const voucherDirectory:Voucher[] = [
    {name:"Clearence sell", image:"cards/vouchers/Clearance_Sale.png",tooltip:"Next shop its 50% off!", targetType:false},
    {name:"Crystal Ball",image:"cards/vouchers/Crystal_Ball.png",tooltip:"1 in 4 chance of getting a normal card replaced by an ace in next round", targetType:true, targetCount:3},
]

// Packs

export const errorPack:Package = {
    name:"Error boucher", image:"icons/missing.png", chooseAmount: 1, contentType: 0, contentSize: 1
}

export const packageDirectory:Package[] = [
    {name:"Standar pack", image:"cards/packs/Standard_Normal_1.png", chooseAmount:3, contentType:0, contentSize:3},
    {name:"Buffon pack", image:"cards/packs/Buffoon_Normal_2.png", chooseAmount:1, contentType:1, contentSize:3},
    {name:"Voucher pack", image:"cards/packs/Spectral_Jumbo_1.png", chooseAmount:1, contentType:2, contentSize:2},
]