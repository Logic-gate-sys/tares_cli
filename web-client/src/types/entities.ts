

export type Room = {
  id: string;
  name: string;
  icon: string;
  iconBgClass: string;
  iconTextColorClass: string;
  playersText: string;
  timeLeftText: string;
  avatars: PlayerAvatar[];
  extraPlayersCount?: number; 
}


export type  PlayerAvatar= {
  src: string;
  alt: string;
  bgClass: string;
}