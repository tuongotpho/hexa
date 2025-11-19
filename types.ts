
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface Message {
  id: string;
  text: string | null;
  senderId: string;
  timestamp: Timestamp;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  members: string[];
  groupName?: string;
  groupPhotoURL?: string;
  lastMessage?: {
    text: string;
    timestamp: Timestamp;
  };
  // For 1-on-1 chats, we'll dynamically add other user's profile
  otherUser?: UserProfile;
}
