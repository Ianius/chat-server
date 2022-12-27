import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { ChatServer } from './interfaces';
import cors from 'cors';
import chatHandler from './chat-handler';

dotenv.config();

const app = express();
const port = process.env.PORT;
const server = http.createServer(app);
const io: ChatServer = new Server(server, {
    cors: {
        // TODO: Change later
        origin: "http://localhost:3000",
    }
});

app.use(cors());

io.on('connection', (socket) => {
    chatHandler(io, socket);
});

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
