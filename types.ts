
export interface Participant {
  id: string;
  name: string;
  isMe?: boolean;
  isAi?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  avatar: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
}

export interface LoginLog {
  id: string;
  email: string;
  password: string;
  timestamp: string;
}

export enum MeetingStatus {
  LOBBY = 'LOBBY',
  SIGNING_IN = 'SIGNING_IN',
  JOINED = 'JOINED',
  ENDED = 'ENDED',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
