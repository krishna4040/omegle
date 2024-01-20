import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Socket, io } from 'socket.io-client';

const URL = 'http://localhost:3000';

const Room = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const name = searchParams.get('name');
    const [socket, setSocket] = useState<null | Socket>(null);

    useEffect(() => {
        const socket = io(URL, {
            autoConnect: false
        });
        socket.on('send-offer', ({ roomId }) => {
            alert("send offer please");
            socket.emit('answer', {
                roomId,
                sdp: ''
            });
        });
        socket.on('offer', ({ roomId, offer }) => {
            alert("send answer please");
            socket.emit("answer", {
                roomId,
                sdp: ""
            });
        });
        setSocket(socket);
    }, [name]);

    return (
        <div>Hi {name}</div>
    )
}

export default Room