import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://skillswap-backend-jxyu.onrender.com", { transports: ["websocket"] });

export default function LiveSession() {
  const localRef = useRef(), remoteRef = useRef(), pc = useRef();
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    if (!joined) return;
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current.srcObject = stream;

      pc.current = new RTCPeerConnection(config);
      stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));
      pc.current.ontrack = (e) => remoteRef.current.srcObject = e.streams[0];
      pc.current.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { target: remoteId.current, candidate: e.candidate });
      };

      socket.emit("join-room", room);
    };
    init();
  }, [joined]);

  const remoteId = useRef("");

  useEffect(() => {
    socket.on("peer-joined", async (id) => {
      remoteId.current = id;
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("offer", { target: id, sdp: offer });
    });
    socket.on("offer", async ({ sdp, caller }) => {
      remoteId.current = caller;
      await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("answer", { target: caller, sdp: answer });
    });
    socket.on("answer", async ({ sdp }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      await pc.current.addIceCandidate(candidate);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      {!joined ?
        <>
          <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Room ID" />
          <button onClick={() => setJoined(true)}>Join</button>
        </>
        :
        <>
          <video ref={localRef} autoPlay playsInline muted style={{ width: 300 }} />
          <video ref={remoteRef} autoPlay playsInline style={{ width: 300 }} />
          <button onClick={() => window.location.reload()}>Leave</button>
        </>
      }
    </div>
  );
}
