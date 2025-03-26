
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


//CHAT
export interface ChatBuble{
    id: number,
    isMe: boolean,
    avatar: number,
    username: string,
    timestamp: string,
    message: string,
}