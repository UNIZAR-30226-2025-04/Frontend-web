
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


// INBOX interfaces
export interface invitation {
    key: number
    username: string
    players: number
}
export interface request {
    key: number
    username: string
}