export interface CastMember {
  name: string;
  role: string;
  image?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  year: string;
  rating: string;
  duration: string;
  description: string;
  poster: string;
  backdrop: string;
  category: string;
  genres: string[];
  format: string; // e.g., 'MKV', 'MP4', '4K'
  isTVShow?: boolean;
  season?: number;
  episode?: number;
  progress?: number; // 0 to 100
  isAIEnhanced?: boolean;
  cast?: CastMember[];
}

export type ViewType = 'auth' | 'home' | 'search' | 'downloads' | 'details' | 'player' | 'cloud';

export interface AppState {
  currentView: ViewType;
  selectedMedia: MediaItem | null;
  isPlaying: boolean;
  searchQuery: string;
  isAuthenticated: boolean;
}

export type CloudProvider = 'google' | 'microsoft' | 'none';

export interface CloudFile {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  provider: CloudProvider;
  thumbnail?: string;
}