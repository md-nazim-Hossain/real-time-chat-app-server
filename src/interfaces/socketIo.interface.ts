export type IServerToClientEvents = {
  noArg: () => void;
  newFriendRequest: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
};

export type IClientToServerEvents = {
  friendRequest: (data: any) => void;
};

export type IInterServerEvents = {
  ping: () => void;
};

export type ISocketData = {
  name: string;
  age: number;
};
