// utils/roomUtils.js
import { v4 as uuidv4 } from 'uuid';

// Generate a unique room identifier
export const generateRoomId = () => uuidv4();

// Generate a joinable URL with the room ID
export const generateRoomUrl = (roomId) => {
  const baseUrl = window.location.origin; // Use your application's base URL
  return `${baseUrl}/join?roomId=${encodeURIComponent(roomId)}`;
};