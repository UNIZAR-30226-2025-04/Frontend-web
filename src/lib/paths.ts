// Base url of the backend API

import { writable } from "svelte/store";

export let apiBaseStore = writable('https://nogler.victorr.me/');
export let wsBaseStore = writable('https://nogler.victorr.me/');

// USERS
// me, private information
export let mePath:string = 'auth/me';
// update private information
export let updatePath:string = 'auth/update';
// public information
export let userInfoPath:string = 'users/';

// AUTH
// Login user
export let loginPath:string = 'login';
// Register user
export let signupPath:string = 'signup';


// FRIENDS
// List of a user firends
export let friendsPath:string = 'auth/friends';
// Delete friend
export let deleteFriendPath:string = 'auth/deleteFriend/';
// List of sent friendship request
export let sentRequestsPath:string = 'auth/sent_friendship_requests';
// Delete a sent friendship request
export let deleteSentRequestPath:string = 'auth/sent_friendship_request/';
// Send a friendship request
export let sendFriendshipRequestPath:string = 'auth/sendFriendshipRequest';
// List of received friendship request
export let receivedFriendshipRequestsPath:string = 'auth/received_friendship_requests';
// Delete a received friendship request
export let deleteReceivedRequestsPath:string = 'auth/received_friendship_request/';
// Accept a friendship request
export let addFriendPath:string = 'auth/addFriend';


// LOBBY
// Create a lobby
export let createLobbyPath:string = 'auth/CreateLobby';
// Insert the user into a lobby
export let joinLobbyPath:string = 'auth/joinLobby/';
// Remove the user from the lobby
export let exitLobbyPath:string = 'auth/exitLobby/';
// List of sent lobby invitations
export let sentLobbyInvitationsPath:string = 'auth/sent_lobby_invitations';
// Invite a friend to the lobby
export let sendLobbyInvitationsPath:string = 'auth/sendLobbyInvitation';
// Delete a sent lobby invitation
export let deleteSentLobbyInvitationsPath:string = 'auth/sent_lobby_invitation/';
// Deletes a received game invitation
export let deleteReceivedInvitationPath:string = 'auth/received_lobby_invitation/';
// List of all of the lobbies
export let allLobbiesPath:string = 'auth/getAllLobbies';
// To know if the user is already in a lobby
export let isUserInLobbyPath:string = 'auth/isUserInLobby';
// Set the visibility of a lobby
export let setLobbyVisibilityPath = 'auth/setLobbyVisibility/';
// Matchmaking
export let matchMakingPath:string = 'auth/matchMaking';
// Lobby info
export let lobbyInfoPath:string = 'auth/lobbyInfo';

// GAMELOBBY
// Get all game lobby invitations for the authenticated user
export let receivedGameInvitations:string = 'auth/received_lobby_invitations';

