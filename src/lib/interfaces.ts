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
    isPublic?: boolean
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

// Voucher data
export type Voucher = {
  name: string,
  image: string,
  tooltip: string,
  targetType: boolean,
  targetCount?: number
}

// /game interfaces

export type GameState = {
    playedCards: CardItem[],
	handCards: CardItem[],
	jokers: JokerItem[],
	activeVouchers: VoucherItem[],
	vouchers: VoucherItem[],
    handLevels: HandType[],
    shop: Shop,
    round: number,
    phase: number, // 0 Blind - 1 Play - 2 Shop - 3 Voucher
    minScore: number,
    proposedBlind: number
    handType:number,
    blueScore:number,
    redScore:number,
    hands:number,
    discards:number,
    pot:number,
    money:number,
    rerollAmount:number,
    deckLeft:Card[],
    deckPlayed:Card[],
    timeLeft:number,
}


export type CardItem = {
    id: number,
    card: Card,
    picked: boolean,
};

export type JokerItem = {
    id: number,
    jokerId: number,
    edition: number,
    sellAmount: number,
    picked: boolean
};

export type VoucherItem = {
    id: number,
    voucherId: number,
    sellAmount: number,
    picked: boolean
};

export type HandType = {
    name:string,
    lvl:number
    baseBlue:number,
    baseRed:number
}

export type Shop = {
    jokerRow: JokerItem[],
    voucherRow: VoucherItem[],
    packageRow: PackageItem[]
}

export type Package = {
    name:string,
    image:string,
    chooseAmount: number,
    contentType: number,
    contentSize: number
}

export type PackageItem = {
    id: number,
    packageId: number,
    sellAmount: number,
    contents: CardItem[] | JokerItem[] | VoucherItem[],
} 