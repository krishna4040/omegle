import { useEffect, useRef, useState } from 'react'
import Room from './Room';

const Landing = () => {

    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);

    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const getCam = async () => {
        const streams = await window.navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        const videoTrack = streams.getVideoTracks()[0]
        const audioTrack = streams.getAudioTracks()[0]
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        if (videoRef.current) {
            videoRef.current.srcObject = new MediaStream([videoTrack, audioTrack]);
            videoRef.current.play();
        }
    }

    useEffect(() => {
        getCam()
    }, [videoRef]);

    if (!joined) {
        return (
            <div>
                <video ref={videoRef} style={{ border: '5px solid black' }}></video>
                <input type="text" value={name} placeholder='Enter Name' onChange={(e) => setName(e.target.value)} />
                <button onClick={() => {
                    setJoined(true);
                }}>Join</button>
            </div>
        )
    } else {
        return <Room name={name} localAudioTrack={localAudioTrack!} localVideoTrack={localVideoTrack!} />
    }
}

export default Landing