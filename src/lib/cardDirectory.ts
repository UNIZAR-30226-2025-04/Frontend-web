import type { Voucher, Joker, JokerEdition, Overlay, Suit, HandType, Package } from "./interfaces";

// Regular cards

/**
 * Function to get numerical value from a rank string
 * @param rank 
 * @returns 
 */
export function getValueFromRank(rank:string):number{
    switch(rank){
        case "A": return 11;
        case "K": return 10;
        case "Q": return 10;
        case "J": return 10;
        default:
            return Number(rank);
    }
}

/**
 * Function to get sorting value from a rank string
 * @param rank 
 * @returns 
 */
export function getHierarchyFromRank(rank:string):number{
    switch(rank){
        case "A": return 14;
        case "K": return 13;
        case "Q": return 12;
        case "J": return 11;
        default:
            return Number(rank);
    }
}

/**
 * Index that corresponds to the name of suit in the suitDirectory
 * @param suitName 
 * @returns index
 */
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
    {name:"Royal flush",lvl:1,baseBlue:65,baseRed:50},
    {name:"Straight flush",lvl:1,baseBlue:50,baseRed:40},
    {name:"Flush five",lvl:1,baseBlue:35,baseRed:25},
    {name:"Flush house",lvl:1,baseBlue:32,baseRed:22},
    {name:"Five of a kind",lvl:1,baseBlue:30,baseRed:20},
    {name:"Four of a kind",lvl:1,baseBlue:25,baseRed:15},
    {name:"Full house",lvl:1,baseBlue:20,baseRed:12},
    {name:"Flush",lvl:1,baseBlue:15,baseRed:8},
    {name:"Straight",lvl:1,baseBlue:12,baseRed:5},
    {name:"Three of a kind",lvl:1,baseBlue:10,baseRed:4},
    {name:"Two pair",lvl:1,baseBlue:8,baseRed:3},
    {name:"Pair",lvl:1,baseBlue:4,baseRed:2},
    {name:"High card",lvl:1,baseBlue:1,baseRed:1},
]

// Jokers

export const errorJoker:Joker = {
    name:"Error joker", image:"icons/missing.png",tooltip:"This is an error",rarity:0
}

export const jokerDirectory:Joker[] = [
    {name:"Solid seven joker",image:"cards/jokers/solid_seven.png",tooltip:"+7 chips +7 mult",rarity:0},
    {name:"Poor joker",image:"cards/jokers/poor joker.png",tooltip:"Generates 4 gold each round",rarity:0},
    {name:"Petpet",image:"cards/jokers/petpet.png",tooltip:"Sums the number of gold the user has to mult",rarity:0},
    {name:"Average size michael",image:"cards/jokers/AVERAGE_SIZE_MICHAEL.png",tooltip:"+15 mult, 1/15 chance of being sold each round",rarity:0},
    {name:"Hell cowboy",image:"cards/jokers/hell_cowboy.png",tooltip:"Adds +mult equivalent to the highest scoring card",rarity:0},
    {name:"Crab sponge",image:"cards/jokers/bob_spider.png",tooltip:"+50 chips if you have 3 of the same cards in played hand",rarity:0},
    {name:"Two friends joker",image:"cards/jokers/2 friends.png",tooltip:"Takes 10 of your +chips and changes them to +mult",rarity:0},
    {name:"BIRDIFICATION",image:"cards/jokers/birdification.png",tooltip:"+50 chips for each 1,4,6,7",rarity:0},
    {name:"Photograph",image:"cards/jokers/PHOTOGRAPH.png",tooltip:"x2 mult the first time you play a face card",rarity:1},
    {name:"Empty joker",image:"cards/jokers/empty joker.png",tooltip:"1/50 chance of +25 chips and +200 mult",rarity:1},
    {name:"Lirili Larila",image:"cards/jokers/lirili_larila.png",tooltip:"+2 to to mult for each played / scoring 2 then x2 mult",rarity:1},
    {name:"Rusty ahh",image:"cards/jokers/rusty ahh joker.png",tooltip:"Gold won before this joker applies = 0 but 2x mult",rarity:1},
    {name:"Damn 4th april?",image:"cards/jokers/damn april.jpg",tooltip:"Randomizes chips and mult but guarantee at least +14 in total",rarity:1},
    {name:"crowave",image:"cards/jokers/crowave.png",tooltip:"Grants +3 to the multiplier for each red card with a 90% probability. 10% of the time, it grants +5 tokens per red card instead",rarity:1},
    {name:"bicicleta",image:"cards/jokers/bicicle_ta.png",tooltip:"Each 2 gives +2 mult and +20 chips",rarity:1},
    {name:"salebalatrito",image:"cards/jokers/salebalatrito.png",tooltip:"+50 chips if three of a kind",rarity:1},
    {name:"Diego joker",image:"cards/jokers/diego_joker.png",tooltip:"x4 mult if you only play 3 cards",rarity:1},
    {name:"It's so over",image:"cards/jokers/its so over.png",tooltip:"+10 gold if only 1 (one) card is played",rarity:1},
    {name:"paris",image:"cards/jokers/paris.png",tooltip:"+3 mult for every suited pair in played hand",rarity:2},
    {name:"nasus",image:"cards/jokers/nasus.png",tooltip:"Multiplies your gold by the mult",rarity:2},
    {name:"som brilla",image:"cards/jokers/som brilla.png",tooltip:"Grants +20 mult when only face cards are played",rarity:2},
]

export const jokerEditionsDirectory:JokerEdition[] = [
    {name:"",image:"cards/jokers/joker overlay.png",tooltip:""},
    {name:"Glass",image:"cards/overlays/glassDemo3.png",tooltip:"This is a tooltip for the glass overlay!"}
]

// Vouchers

export const errorVoucher:Voucher = {
    name:"Error boucher", image:"icons/missing.png",tooltip:"Error boucher",targetType:true,targetCount:1
}

export const voucherDirectory:Voucher[] = [
    {name:"DAMN", image:"cards/vouchers/voucher damn.png",tooltip:"Divide starting chips and mult by half", targetType:true, targetCount:3},
    {name:"Pablo Honey", image:"cards/vouchers/voucher pablo honey.png",tooltip:"Earn 1 dollar for each card played", targetType:false},
    {name:"Random Access Memories", image:"cards/vouchers/voucher RAM.png",tooltip:"Remove one joker from other player's rack chosen randomly", targetType:true, targetCount:1},
    {name:"Weezer", image:"cards/vouchers/voucher weezer.png",tooltip:"Bans up to 4 players to play four of a kind for 1 round", targetType:true, targetCount:4},
    {name:"Blonde", image:"cards/vouchers/voucher blond.png",tooltip:"Bans up to 2 players from playing straights for 1 round", targetType:true, targetCount:2},
    {name:"Abbey Road", image:"cards/vouchers/voucher abbey road.png",tooltip:"Every King or Queen played scores negative points", targetType:true, targetCount:4},
    {name:"Rock transgresivo", image:"cards/vouchers/voucher extremoduro.png",tooltip:"Aces and K's score double", targetType:false},
    {name:"Diamond Eyes", image:"cards/vouchers/vouchers deftones.png",tooltip:"Applicable to up to 3 players. Subtracts from their mult the money they have", targetType:true, targetCount:3},
    {name:"The money store", image:"cards/vouchers/voucher victor.png",tooltip:"Each black card played (spades and clubs) grants 1 dollar, +10 chips, +2 mult", targetType:false},
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