import { Socket, Server } from "socket.io";
import express, { Request, Response } from 'express'
import { createServer } from 'http'

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket: Socket) => {
    console.log('a user connected');
});

app.use(express.json({ limit: '50mb' }));

httpServer.listen(3000, () => console.log("app listning succsesfully on 3000"));
app.get('/', (req: Request, res: Response) => res.send('<h1>Home page for api</h1>'))