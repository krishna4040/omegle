import { useEffect, useRef, useState } from 'react'
import { Socket, io } from 'socket.io-client';

const URL = 'http://localhost:3000';

interface props {
    name: string;
    localAudioTrack: MediaStreamTrack;
    localVideoTrack: MediaStreamTrack;
}

const Room = ({ name, localAudioTrack, localVideoTrack }: props) => {

    const [lobby, setLobby] = useState(false);
    const [socket, setSocket] = useState<null | Socket>(null);

    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [ReceivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);

    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);

    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = io(URL);

        socket.on('send-offer', async ({ roomId }) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);

            // when we send-offer side we add local-media-stream
            if (localAudioTrack && localVideoTrack) {
                pc.addTrack(localAudioTrack)
                pc.addTrack(localVideoTrack)
            }

            // STUN server hit to get public ip every time send-offer is running
            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId
                    })
                }
            }

            pc.onnegotiationneeded = async () => {
                // setting local session description
                const sdp = await pc.createOffer();
                await pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }

            const sdp = await pc.createOffer();
            socket.emit('offer', {
                roomId,
                sdp
            })
        })

        socket.on('offer', async ({ roomId, sdp: remoteSdp }) => {
            setLobby(false)
            const pc = new RTCPeerConnection()
            setReceivingPc(pc)

            await pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer()
            await pc.setLocalDescription(sdp)

            // Hitting STUN server
            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId
                    })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp
            })

            const track1 = pc.getTransceivers()[0].receiver.track
            const track2 = pc.getTransceivers()[1].receiver.track
            if (track1.kind === "video") {
                setRemoteAudioTrack(track2)
                setRemoteVideoTrack(track1)
            } else {
                setRemoteAudioTrack(track1)
                setRemoteVideoTrack(track2)
            }
            // Adding remote-media to Remote-video-ref
            if (remoteVideoRef.current && remoteVideoTrack && remoteAudioTrack) {
                // //@ts-ignore
                // remoteVideoRef.current.srcObject.addTrack(track1)
                // //@ts-ignore
                // remoteVideoRef.current.srcObject.addTrack(track2)
                // //@ts-ignore
                remoteVideoRef.current.srcObject = new MediaStream([remoteVideoTrack, remoteAudioTrack])
                remoteVideoRef.current.play();
            }
        })

        socket.on("answer", async ({ sdp: remoteSdp }) => {
            setLobby(false)
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc
            })
        })

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            if (type == "sender") {
                setReceivingPc(pc => {
                    pc?.addIceCandidate(candidate)
                    return pc
                })
            } else {
                setSendingPc(pc => {
                    pc?.addIceCandidate(candidate)
                    return pc
                })
            }
        })

        socket.on("lobby", () => {
            setLobby(true)
        })

        setSocket(socket);
    }, [name])

    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = new MediaStream([localAudioTrack, localVideoTrack])
            localVideoRef.current.play()
        }
    }, [localVideoRef])

    return (
        <div>
            Hi {name}
            <video autoPlay width={400} height={400} ref={localVideoRef} />
            {lobby ? "Waiting to connect you to someone" : null}
            <video autoPlay width={400} height={400} ref={remoteVideoRef} />
        </div>
    )
}

export default Room