
// All user data and information
export interface UserData {
    username: string
    email: string
    password: string
    icon: number
    token: string
    remember: boolean
}

// Form of profile information change
export interface ProfileChangeFormData {
    name: string
    image: number
    password: string | null
}

// Avatar has a name of the image and a link to the image
export interface avatar{
    name: string
    link: string
}

export interface publicInformationUser {
    username: string
    icon: number
}

// LOBBY

export interface Lobby {
    code: string
    host: boolean
    players: Player[]
}

// INBOX AND FRIENDS interfaces
export interface invitation {
    key: number
    username: string
    code: string
    players: number
}
export interface request {
    key: number
    username: string
}

export interface userItem {
    key: number
    username: string
    icon: number
}

// SHARE modal

export interface inviteItem{
    key: number
    username: string
    icon: number
    sent: boolean
}

// LOBBY
// Information regarding lobbies
export interface LobbyInfo {
    lobby_id: string;
    creator_username: string;
    host_icon: number;
    number_rounds: number;
    total_points: number;
    created_at: string;
  }

// Interface to display in the lobbies list
export interface LobbyDisplay {
    key: string;
    host: string;
    icon: number;
    players?: number; // We could not have this information
    maxPlayers?: number;
    rounds?: number;
    points?: number;
}

// Player type
export type Player = {
    key: number;
    username: string;
    icon: number;
    host: boolean;
  };


//CHAT
export interface ChatBuble{
    id: number,
    isMe: boolean,
    avatar: number,
    username: string,
    timestamp: string,
    message: string,
}


// GAME

// Suit of a card
export type Suit = {
    name:string,
    color:number,
    image:string
}

// Normal playing card
export type Card = {
    rank: string,
    suit: string,
    faceUp: boolean,
    overlay: number
}

// Overlay for cards
export type Overlay = {
    name:string,
    image:string,
    tooltip:string,
}

// Joker data
export type Joker = {
    name:string,
    image:string,
    tooltip:string,
}

// Edition of the joker
export type JokerEdition = {
    name:string,
    image:string,
    tooltip:string
}

// Boucher data
export type Boucher = {
    name:string,
    image:string,
    tooltip:string,
}


// /game interfaces

export type GameState = {
    playedCards: CardItem[],
	handCards: CardItem[],
	jokers: JokerItem[],
	activeBouchers: BoucherItem[],
	bouchers: BoucherItem[],
    handLevels: HandType[],
    round: number,
    minScore: number,
    handType:number,
    blueScore:number,
    redScore:number,
    hands:number,
    discards:number,
    pot:number,
    money:number,
    deckSize:number,
    deckLeft:number,
    timeLeft:number,
}

export type CardItem = {
    key: number,
    card: Card,
    picked: boolean,
};

export type JokerItem = {
    key: number,
    id: number,
    edition: number
};

export type BoucherItem = {
    key: number,
    id: number
};

export type HandType = {
    name:string,
    lvl:number
    baseBlue:number,
    baseRed:number
}

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