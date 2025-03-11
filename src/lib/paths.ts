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


// FRIENDS
// List of a user firends
export const friendsPath:string = apiBase + 'auth/friends';
// Delete friend
export const deleteFriendPath:string = apiBase + 'auth/deleteFriend/';
// List of sent friendship request
export const sentRequestsPath:string = apiBase + 'auth/sent_friendship_requests';
// Delete a sent friendship request
export const deleteSentRequestPath:string = apiBase + 'auth/sent_friendship_request/';
// Send a friendship request
export const sendFriendshipRequestPath:string = apiBase + 'auth/sendFriendshipRequest';
// List of received friendship request
export const receivedFriendshipRequestsPath:string = apiBase + 'auth/received_friendship_requests';
// Delete a received friendship request
export const deleteReceivedRequestsPath:string = apiBase + 'auth/received_friendship_requests/';
// Accept a friendship request
export const addFriendPath:string = apiBase + 'auth/addFriend';


// LOBBY
// Create a lobby
export const createLobbyPath:string = apiBase + 'auth/CreateLobby';

// GAMELOBBY
// Get all game lobby invitations for the authenticated user
export const recievedGameInvitations:string = apiBase + 'auth/received_lobby_invitations';

