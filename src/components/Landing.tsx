import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Room from './Room';

const Landing = () => {

    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    const getCam = async () => {
        const streams = await window.navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        const videoTrack = streams.getAudioTracks()[0]
        const audioTrack = streams.getVideoTracks()[0]
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        if (!videoRef.current) {
            return;
        }
        videoRef.current.srcObject = new MediaStream([videoTrack]);
        videoRef.current.play();
    }

    useEffect(() => {
        if (videoRef && videoRef.current) {
            getCam();
        }
    }, [videoRef]);

    if (!joined) {
        return (
            <div>
                <video ref={videoRef}></video>
                <input type="text" value={name} placeholder='Enter Name' onChange={(e) => setName(e.target.value)} />
                <button onClick={() => {
                    setJoined(true);
                }}>Join</button>
            </div>
        )
    } else {
        return <Room localVideoRef={videoRef} name={name} localAudioTrack={localAudioTrack!} localVideoTrack={localVideoTrack!} />
    }
}

export default Landing