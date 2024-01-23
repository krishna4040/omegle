import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Socket, io } from 'socket.io-client';

const URL = 'http://localhost:3000';

interface props {
    name: string;
    localAudioTrack: MediaStreamTrack;
    localVideoTrack: MediaStreamTrack;
    localVideoRef: React.RefObject<HTMLVideoElement>
}

const Room = ({ name, localAudioTrack, localVideoTrack, localVideoRef }: props) => {

    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby, setLobby] = useState(false);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [RecievingPc, setRecievingPc] = useState<RTCPeerConnection | null>(null);

    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = io(URL);
        // Me sending offer
        socket.on('send-offer', async ({ roomId }) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);
            pc.addTrack(localAudioTrack);
            pc.addTrack(localVideoTrack);

            pc.onicecandidate = async () => {
                const sdp = await pc.createOffer();
                socket.emit('offer', {
                    sdp,
                    roomId
                })
            }

            const sdp = await pc.createOffer();
            socket.emit('offer', {
                roomId,
                sdp
            });
        });

        // when other side receives offer
        socket.on('offer', async ({ roomId, sdp }) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription({ sdp, type: 'offer' });
            const newsdp = await pc.createAnswer();
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
            setRemoteMediaStream(stream);
            setRecievingPc(pc);
            pc.ontrack = (({ track, type }) => {
                if (type == 'audio') {
                    //@ts-ignore
                    remoteVideoRef.current?.srcObject.addTrack(track);
                } else {
                    //@ts-ignore
                    remoteVideoRef.current?.srcObject.addTrack(track);
                }
                remoteVideoRef.current?.play();
            });
            socket.emit("answer", {
                roomId,
                sdp: newsdp
            });
        });

        socket.on('answer', ({ roomId, sdp }) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription({
                    type: 'answer',
                    sdp
                });
                return pc;
            });
            socket.on("lobby", () => setLobby(true));
        })
        setSocket(socket);
    }, [name]);

    // if (lobby) {
    //     return (
    //         <div>
    //             Waiting to connect...
    //         </div>
    //     )
    // }

    return (
        <div>
            Hi {name}
            <video ref={localVideoRef} autoPlay width={400} height={400} ></video>
            <video autoPlay width={400} height={400} ref={remoteVideoRef}></video>
        </div>
    )
}

export default Room