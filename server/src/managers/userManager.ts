import { Socket } from "socket.io";
import { RoomManager } from "./roomManager";

export interface User {
    socket: Socket;
    name: string;
}

export class UserManager {

    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;

    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: Socket) {
        this.users.push({
            name,
            socket
        });
        this.queue.push(socket.id);
        this.clearQueue();
        this.initialHandlers(socket);
    }
    removeUser(socketId: string) {
        this.users.find(x => x.socket.id === socketId);
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x !== socketId);
    }
    clearQueue() {
        if (this.queue.length < 2) {
            return;
        }
        const user1 = this.users.find(x => x.socket.id === this.queue.pop());
        const user2 = this.users.find(x => x.socket.id === this.queue.pop());
        this.roomManager.createRoom(user1!, user2!);
        this.clearQueue();
    }

    initialHandlers(socket: Socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            this.roomManager.onOffer(roomId, sdp);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            this.roomManager.onAnswer(roomId, sdp);
        })
    }
}