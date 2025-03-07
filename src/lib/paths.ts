// Base url of the backend API
export const apiBase:string = 'https://nogler.ddns.net/';

// USERS
// me, private information
export const mePath:string = apiBase + 'auth/me';
// update private information
export const updatePath:string = apiBase + 'auth/update';


// AUTH
// Login user
export const loginPath:string = apiBase + 'login';
// Register user
export const sigupPath:string = apiBase + 'signup';