// Base url of the backend API
export const apiBase:string = 'https://nogler.ddns.net/';

// USERS
export const mePath:string = apiBase + 'auth/me';


// AUTH
// Login user
export const loginPath:string = apiBase + 'login';
// Register user
export const sigupPath:string = apiBase + 'signup';


// FRIENDS
// List of a user firends
export const friendsPath:string = apiBase + 'auth/friends';
export const requestsPath:string = apiBase + 'auth/received_friendship_requests';
export const deleteFriendPath:string = apiBase + 'auth/deleteFriend/';