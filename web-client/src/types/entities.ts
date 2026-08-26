

export type Room = {
  id?: string;
  name: string;
  capacity: number; 
  icon?: string; // icon url return from server 
  iconBgClass: string;
  iconTextColorClass: string;
  playersText?: string;
  timeLeftText?: string;
  avatars?: PlayerAvatar[];
  extraPlayersCount?: number; 
}


export type  PlayerAvatar= {
  src: string;
  alt: string;
  bgClass: string;
}


export type RoomCreateType = {
  name: string;
  capacity: number;
  iconBgClass: string;
  iconTextColorClass: string;
}