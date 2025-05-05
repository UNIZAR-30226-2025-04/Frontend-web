// Base url of the backend API
export const apiBase:string = 'https://nogler.ddns.net/';
// Base url to socket
export const wsBase:string = 'https://nogler.ddns.net:443'

// USERS
// me, private information
export const mePath:string = apiBase + 'auth/me';
// update private information
export const updatePath:string = apiBase + 'auth/update';
// public information
export const userInfoPath:string = apiBase + 'users/';

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
export const deleteReceivedRequestsPath:string = apiBase + 'auth/received_friendship_request/';
// Accept a friendship request
export const addFriendPath:string = apiBase + 'auth/addFriend';


// LOBBY
// Create a lobby
export const createLobbyPath:string = apiBase + 'auth/CreateLobby';
// Insert the user into a lobby
export const joinLobbyPath:string = apiBase + 'auth/joinLobby/';
// Remove the user from the lobby
export const exitLobbyPath:string = apiBase + 'auth/exitLobby/';
// List of sent lobby invitations
export const sentLobbyInvitationsPath:string = apiBase + 'auth/sent_lobby_invitations';
// Invite a friend to the lobby
export const sendLobbyInvitationsPath:string = apiBase + 'auth/sendLobbyInvitation';
// Delete a sent lobby invitation
export const deleteSentLobbyInvitationsPath:string = apiBase + 'auth/sent_lobby_invitation/';
// Deletes a received game invitation
export const deleteReceivedInvitationPath:string = apiBase + 'auth/received_lobby_invitation/';
// List of all of the lobbies
export const allLobbiesPath:string = apiBase + 'auth/getAllLobbies';
// To know if the user is already in a lobby
export const isUserInLobbyPath:string = apiBase + 'auth/isUserInLobby';
// Set the visibility of a lobby
export const setLobbyVisibilityPath = apiBase + 'auth/setLobbyVisibility/';

// GAMELOBBY
// Get all game lobby invitations for the authenticated user
export const receivedGameInvitations:string = apiBase + 'auth/received_lobby_invitations';

