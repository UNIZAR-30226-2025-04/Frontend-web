
// All user data and information
export interface UserData {
    username: string,
    email: string,
    password: string,
    icon: number,
    token: number
}

// Form of profile information change
export interface ProfileChangeFormData {
    name: string;
    image: number;
    password: string | null;
}

// Avatar has a name of the image and a link to the image
export interface avatar{
    name: string,
    link: string
}
