export interface LineProfile {
    displayName: string;
    pictureUrl?: string;
  }
  
  export interface LineMessageEvent {
    type: string;
    message: {
      type: string;
      text: string;
    };
    source: {
      userId: string;
      roomId?: string;
      groupId?: string;
    };
    replyToken: string;
  }