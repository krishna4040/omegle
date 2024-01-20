import { Socket, Server } from "socket.io";
import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { UserManager } from "./managers/userManager";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
    console.log('a user connected');
    userManager.addUser("abc", socket);
    socket.on('disconnect', () => {
        userManager.removeUser(socket.id);
    })
});

app.use(express.json({ limit: '50mb' }));

httpServer.listen(3000, () => console.log("app listning succsesfully on 3000"));
app.get('/', (req: Request, res: Response) => res.send('<h1>Home page for api</h1>'))