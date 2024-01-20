import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Socket, io } from 'socket.io-client';

const URL = 'http://localhost:3000';

const Room = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const name = searchParams.get('name');
    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby, setLobby] = useState(false);

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', ({ roomId }) => {
            alert("send offer please");
            socket.emit('offer', {
                roomId,
                sdp: ''
            });
        });
        socket.on('offer', ({ roomId }) => {
            alert("send answer please");
            socket.emit("answer", {
                roomId,
                sdp: ''
            });
            socket.on('lobby', () => setLobby(true));
        });
        socket.emit("answer", {
            roomId,
            sdp: sdp
        });
        setSocket(socket);
    }, [name]);

    if (lobby) {
        return (
            <div>
                Waiting to connect...
            </div>
        )
    }

    return (
        <div>Hi {name}</div>
    )
}

export default Room