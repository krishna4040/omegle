import { Socket } from "socket.io";
import { roomManager } from "./roomManager";

export interface User {
    socket: Socket;
    name: string;
}

export class UserManager {

    private users: User[];
    private queue: string[];
    private roomManager: roomManager;

    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new roomManager();
    }

    addUser(name: string, socket: Socket) {
        this.users.push({
            name,
            socket
        });
        this.queue.push(socket.id);
        this.initialHandlers(socket);
        this.clearQueue();
    }
    removeUser(socketId: string) {
        this.users = this.users.filter(x => x.socket.id === socketId);
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