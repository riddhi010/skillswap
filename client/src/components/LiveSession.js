import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://skillswap-backend-jxyu.onrender.com/"); 

const LiveSession = () => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef();
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);

  const config = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ],
  };

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;

    peerConnection.current = new RTCPeerConnection(config);

    stream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          target: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    socket.emit("join-room", roomId);
    setInCall(true);
  };

  let remoteSocketId = "";

  useEffect(() => {
    socket.on("room-created", () => {
      console.log("Room created, waiting for peer...");
    });

    socket.on("room-joined", () => {
      console.log("Joined room, creating offer...");
      createOffer();
    });

    socket.on("peer-joined", (id) => {
      remoteSocketId = id;
      console.log("Peer joined:", id);
    });

    socket.on("offer", async ({ sdp, caller }) => {
      remoteSocketId = caller;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { target: caller, sdp: answer });
    });

    socket.on("answer", async ({ sdp }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection.current.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createOffer = async () => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { target: remoteSocketId, sdp: offer });
  };

  return (
    <div>
      {!inCall ? (
        <>
          <input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={startCall}>Join Call</button>
        </>
      ) : (
        <div>
          <video ref={localVideo} autoPlay playsInline muted />
          <video ref={remoteVideo} autoPlay playsInline />
        </div>
      )}
    </div>
  );
};

export default LiveSession;
