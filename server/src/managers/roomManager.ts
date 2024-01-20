import { User } from "./userManager";

let ID = 0;
export interface Room {
    user1: User;
    user2: User;
}

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map<string, Room>();
    }

    private generate() { return ID++; }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate();
        this.rooms.set(roomId.toString(), {
            user1,
            user2
        });
        user1.socket.emit("send-offer", {
            roomId
        });
    }

    onOffer(roomId: string, sdp: string) {
        const user2 = this.rooms.get(roomId)?.user2;
        user2?.socket.emit("offer", {
            roomId,
            sdp
        });
    }

    onAnswer(roomId: string, sdp: string) {
        const user1 = this.rooms.get(roomId)?.user1;
        user1?.socket.emit("answer", {
            sdp
        });
    }
}