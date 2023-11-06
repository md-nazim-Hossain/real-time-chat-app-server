export type IServerToClientEvents = {
  noArg: () => void;
  newFriendRequest: (a: any) => void;
  friendRequestAccepted: (a: any) => void;
  requestSent: (a: any) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
};

export type IClientToServerEvents = {
  friendRequest: (data: any, callback: (a: any) => void) => void;
  acceptRequest: (data: any, callback: (a: any) => void) => void;
  textMessage: (data: any, callback: (a: any) => void) => void;
  getDirectConversation: (data: any, callback: (a: any) => void) => void;
  fileMessage: (data: any, callback: (a: any) => void) => void;
  end: (data: any, callback: (a: any) => void) => void;
};

export type IInterServerEvents = {
  ping: () => void;
};

export type ISocketData = {
  name: string;
  age: number;
};
