import type { ChatBuble } from "$lib/interfaces";
import { chatFeedElem, chatStore, userDataStore, unreadMessages } from "$lib/stores";
import { get } from "svelte/store";

// Function to scroll to bottom on new message
function scrollChatBottom(behavior?: ScrollBehavior): void {
    get(chatFeedElem).scrollTo({ top: get(chatFeedElem).scrollHeight, behavior });
}

export function addMessage(username: string, icon: number, message: string): void {
    // Gets the time and formats it
    const now = new Date();
    const timeString = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    
    // Create bubble
    const newMessage: ChatBuble = {
        id: get(chatStore).length,
        isMe: username === get(userDataStore).username, 
        avatar: icon,
        username: username,
        timestamp: timeString,
        message: message,
    };

    // Append the new message to the message feed
    chatStore.update(chats => [...chats, newMessage]);

    // If the message is not from the current user, mark as unread
    if (!newMessage.isMe) {
        unreadMessages.set(true);
    }

    // Smoothly scroll to the bottom of the feed
    if (get(chatFeedElem) !== undefined) {
        setTimeout(() => { scrollChatBottom('smooth'); }, 0);
    }
}

// Add this function to mark messages as read when chat is opened
export function markMessagesAsRead(): void {
    unreadMessages.set(false);
}