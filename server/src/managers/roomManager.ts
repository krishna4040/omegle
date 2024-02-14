import { User } from "./userManager";

let ID = 0
export interface Room {
    user1: User;
    user2: User;
}

type roomId = string;

export class RoomManager {
    private rooms: Map<roomId, Room>

    constructor() {
        this.rooms = new Map<roomId, Room>()
    }

    private generate() { return ID++ }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString()
        this.rooms.set(roomId, { user1, user2 })
        user1.socket.emit("send-offer", { roomId })
        user2.socket.emit("send-offer", { roomId })
    }

    onOffer(roomId: roomId, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId)
        if (!room) {
            return
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1
        receivingUser.socket.emit("offer", {
            sdp,
            roomId
        })
    }

    onAnswer(roomId: roomId, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId)
        if (!room) {
            return
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1

        receivingUser.socket.emit("answer", {
            sdp,
            roomId
        })
    }

    onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId)
        if (!room) {
            return
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1
        receivingUser.socket.emit("add-ice-candidate", ({ candidate, type }))
    }
}