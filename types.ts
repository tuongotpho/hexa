export interface FileMetadata {
  name: string;
  type: string;
  size: number;
}

export interface Message {
  id: number;
  created_at: string;
  user_id: string;
  recipient_id: string | null; // Added for 1-on-1 chat
  content: string | null;
  image_url: string | null; // Will now be used as a generic file URL
  file_metadata: FileMetadata | null; // New field to store file details
  status: 'sent' | 'read' | null;
  profile?: Profile; // FIX: Made profile optional to handle cases where a user might not have a profile.
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}
