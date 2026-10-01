
export type Room = {
  id: string;
  ownerId?: number;
  name: string;
  capacity: number; 
  status?: 'online'|'offline'|'playing'|'waiting'
  icon: string; // icon url return from server 
  iconBgClass: string;
  iconTextColorClass: string;
  playersText?: string;
  timeLeftText?: string;
  avatars?: PlayerAvatar[];
  extraPlayersCount?: number; 
}

// join request 
export type Request = {
  id?: string;
  roomId?: string;
  requesterId?: number;
  petitionNumber?: string;
  timeAgo?: string;
  expiresIn?: string;
  playerName?: string;
  playerLevel?: number;
  playerRank?: 'BEGINNER' | 'INTERMEDIATE' | "PROFESSIONAL" |"EXPERT"|"GENIUS" | string;
  stats?: PetitionStats;
  targetRoom?: string;
  hostBypass?: 'YES' | 'NO';
  status: 'pending'|'resolved' | 'error' | 'rejected';
}

interface PetitionStats {
  wins: number;
  accuracy: number;
  ping: number;
}


interface PetitionStats {
  wins: number;
  accuracy: number;
  ping: number;
}

export type  PlayerAvatar= {
  src: string;
  alt: string;
  bgClass: string;
}


export type Requestor = {
  id?: number;
  name: string;
  }

export type RoomCreateType = {
  name: string;
  capacity: number;
  icon: string;
  iconBgClass: string;
  iconTextColorClass: string;
}