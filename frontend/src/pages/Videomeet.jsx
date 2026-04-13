import React, { useEffect, useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import io from "socket.io-client";
import styles from "../styles/videoComponent.module.css";
import IconButton from '@mui/material/IconButton';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import Badge from '@mui/material/Badge';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import server from '../environment';
import { useParams } from "react-router-dom";
import SummaryCard from '../components/SummaryCard';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PrivateNotes from '../components/Notes';


const server_url = server;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;;
var connections = {};
const peerConfigConnections = {
    "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
}

function Videomeet() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    const recognitionRef = useRef(null);
    let routeTo = useNavigate();
    let localVideoref = useRef();

    let [videoAvailable, setvideoAvailable] = useState(true);
    const [oldTranscript, setOldTranscript] = useState([]);
    let [audioAvailable, setaudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showmodal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState();
    let [askForUsername, setaskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    const [showNotes, setShowNotes] = useState(false);

    // ── AI Summary states ──
    const [aiSummary, setAiSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // ── AI Summary function ──
    const generateSummary = async (transcripts) => {
        if (!transcripts || transcripts.length === 0) return;
        setSummaryLoading(true);
        setShowSummary(true);

        const transcriptText = transcripts
            .map(t => `${t.sender}: ${t.text}`)
            .join("\n");

const prompt = `You are an intelligent meeting assistant who helps late joiners catch up quickly. Analyze this meeting transcript and return ONLY a valid JSON object, no markdown, no backticks, no extra text.

TRANSCRIPT:
${transcriptText}

Return exactly this JSON structure:
{
  "summary": "2-3 sentence simple overview of what the meeting is about, written like you are explaining to a friend who just joined late",
  "topics": ["main topic 1", "main topic 2"],
  "actionItems": [{"person": "name or Team", "task": "clear specific task"}],
  "deadlines": ["name: what needs to be done by when"],
  "suggestions": ["practical suggestion based on discussion"],
  "keywords": ["important term or name or project"]
}

Follow these rules strictly:
- summary: write in simple conversational english, max 3 sentences, focus on WHAT was decided not HOW it was discussed
- topics: max 4 topics, only what was actually discussed heavily
- actionItems: must say WHO does WHAT clearly — vague items like "team will discuss" are not allowed
- deadlines: only real dates or timeframes mentioned — if none then return []
- suggestions: think like a smart colleague — what should the team do next based on this discussion
- keywords: pick names of people, projects, tools, technologies mentioned — max 6
- if transcript is very short, still return your best guess based on whatever is available
- NEVER return markdown — ONLY raw JSON that can be parsed with JSON.parse()`;

        try {
      const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );
            const data = await response.json();
            if (!response.ok) {
    console.log("API Error:", data);
    setAiSummary({ error: true });
    setSummaryLoading(false);
    return;
}
if (!data.candidates || data.candidates.length === 0) {
    setAiSummary({ error: true });
    setSummaryLoading(false);
    return;
}

            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(text);
            setAiSummary(parsed);
        } catch (e) {
            setAiSummary({ error: true });
            console.log("AI error:", e);
        } finally {
            setSummaryLoading(false);
        }
    };

    const startSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit("audio-transcript", { text: transcript, sender: username });
            }
        };
        recognition.start();
        recognitionRef.current = recognition;
    };

    const { url } = useParams();

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            setvideoAvailable(!!videoPermission);
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            setaudioAvailable(!!audioPermission);
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) localVideoref.current.srcObject = userMediaStream;
                }
            }
        } catch (e) { console.log(e); }
    };

    useEffect(() => { getPermissions(); }, []);

    let getUserMediaSuccess = (stream) => {
        try { window.localStream.getTracks().forEach(track => track.stop()); } catch (e) { }
        window.localStream = stream;
        localVideoref.current.srcObject = stream;
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                }).catch(e => console.log(e));
            });
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false); setAudio(false);
            try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()); } catch (e) { }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
            for (let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                    }).catch(e => console.log(e));
                });
            }
        });
    };

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start(); ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        return Object.assign(canvas.captureStream().getVideoTracks()[0], { enabled: false });
    };

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess).catch(e => console.log(e));
        } else {
            try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()); } catch (e) { }
        }
    };

    useEffect(() => { if (video !== undefined && audio !== undefined) getUserMedia(); }, [audio, video]);

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    };

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [...prevMessages, { sender: sender, data: data }]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io(server_url);

        socketRef.current.on("previous-transcripts", (data) => {
            console.log("Old transcript:", data);
            setOldTranscript(data);
            generateSummary(data); // ← AI summary trigger
        });

        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on("chat-message", addMessage);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", url);
            socketIdRef.current = socketRef.current.id;
            setTimeout(() => { startSpeechRecognition(); }, 2000);

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };
                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(v => v.socketId === socketListId);
                        if (videoExists) {
                            setVideos(videos => {
                                const updated = videos.map(v => v.socketId === socketListId ? { ...v, stream: event.stream } : v);
                                videoRef.current = updated;
                                return updated;
                            });
                        } else {
                            let newVideo = { socketId: socketListId, stream: event.stream, autoPlay: true, playsInline: true };
                            setVideos(videos => {
                                const updated = [...videos, newVideo];
                                videoRef.current = updated;
                                return updated;
                            });
                        }
                    };
                    if (window.localStream) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        try { connections[id2].addStream(window.localStream); } catch (e) { }
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                            }).catch(e => console.log(e));
                        });
                    }
                }
            });
        });
    };

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    let handleVideo = () => { setVideo(!video); };
    let handleAudio = () => { setAudio(!audio); };
    let handleScreen = () => { setScreen(!screen); };

    let getDisplayMediaSucess = (stream) => {
        try { window.localStream.getTracks().forEach(t => t.stop()); } catch (e) { }
        window.localStream = stream;
        localVideoref.current.srcObject = stream;
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                }).catch(e => console.log(e));
            });
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()); } catch (e) { }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
            getUserMedia();
        });
    };

    let getDisplayMedia = () => {
        if (screen && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDisplayMediaSucess).catch(e => console.log(e));
        }
    };

    useEffect(() => { if (screen !== undefined) getDisplayMedia(); }, [screen]);

    let sendMessages = () => {
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    };

    let handleEndCall = () => {
        try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()); } catch (e) { }
        if (recognitionRef.current) recognitionRef.current.stop();
        routeTo('/home');
    };



    // ── Summary Card Component ──
   

    return (
        <div>
            {askForUsername === true ?
                <div>
                    <h2>Enter into Lobby</h2>
                    <TextField id="outlined-basic" label="username" value={username} variant="outlined" onChange={e => setUsername(e.target.value)} />
                    <Button variant="contained" onClick={() => { setaskForUsername(false); getMedia(); }}>Connect</Button>
                    <div>
                        <video ref={localVideoref} autoPlay muted style={{ width: "300px", objectFit: "cover", marginTop: "60px" }}></video>
                    </div>
                </div>
                :
                <div className={styles.meetVideoContainer}>
                      {/* Summary card — chat ke upar */}
                               {showSummary && (
    <SummaryCard
        aiSummary={aiSummary}
        summaryLoading={summaryLoading}
        onClose={() => setShowSummary(false)}
    />
)}

                    {/* ── Chat Room + Summary ── */}
                    {showmodal ?
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer} style={{ display: "flex", flexDirection: "column", height: "100%" }}>

                              

                                <h1>Chats</h1>

                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? messages.map((item, index) => (
                                        <div className={styles.mychatBox} key={index}>
                                            <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "9px" }}>
                                                <p style={{ color: "#2ad7c6" }}>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        </div>
                                    )) : <p>No Messages Yet</p>}
                                </div>

                                <div className={styles.chatingArea}>
                                    <input type="text" placeholder='Enter message' value={message} onChange={e => setMessage(e.target.value)} className={styles.mymessage} />
                                    <IconButton onClick={sendMessages} sx={{ borderRadius: "20px" }} style={{ color: "white", backgroundColor: "#26e3cd", padding: "13px" }}>
                                        <SendIcon />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                        : <></>}
                    {showNotes && <PrivateNotes onClose={() => setShowNotes(false)} />}
                    {/* ── Controls ── */}
                    <div className={styles.buttonContainer}>
                        <IconButton onClick={handleVideo} sx={{ borderRadius: "20px" }} style={{ color: "white", backgroundColor: "#2f3338", padding: "13px" }}>
                            {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} sx={{ borderRadius: "20px" }} style={{ color: "white", backgroundColor: "#fe4242ff", padding: "13px" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} sx={{ borderRadius: "20px" }} style={{ color: "white", backgroundColor: "#2f3338", padding: "13px" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleScreen} sx={{ borderRadius: "20px" }} style={{ color: "white", backgroundColor: "#2f3338", padding: "13px" }}>
                            {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                        </IconButton>
                        <Badge badgeContent={newMessages} max={999} color='primary'>
                            <IconButton onClick={() => setModal(!showmodal)} sx={{ borderRadius: "20px" }} style={{ color: "white", backgroundColor: "#2f3338", padding: "13px" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                        <IconButton onClick={() => setShowNotes(!showNotes)} sx={{ borderRadius: "20px" }} style={{ color: "white", backgroundColor: "#2f3338", padding: "13px" }}>
                            <TextSnippetIcon />
                        </IconButton>

                    </div>

                    {/* ── Videos ── */}
                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video data-socket={video.socketId} ref={ref => { if (ref && video.stream) ref.srcObject = video.stream; }} autoPlay></video>
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>
    );
}

export default Videomeet;