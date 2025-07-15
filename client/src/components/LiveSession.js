// 📁 client/src/LiveSession.jsx

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://skillswap-backend-jxyu.onrender.com/"); 

const LiveSession = () => {
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const localStream = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    socket.on("user-joined", () => {
      if (!peerRef.current) {
        callUser();
      }
    });

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleCandidate);

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  const handleCreateRoom = async () => {
    const id = Math.random().toString(36).substring(2, 10);
    await joinRoom(id);
  };

  const joinRoom = async (id) => {
    setRoomId(id);
    setInCall(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current.srcObject = stream;
      localStream.current = stream;
      socket.emit("join-room", id);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const callUser = async () => {
  peerRef.current = createPeer();

  if (localStream.current) {
    localStream.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, localStream.current);
    });
  }

  const offer = await peerRef.current.createOffer();
  await peerRef.current.setLocalDescription(offer);
  socket.emit("offer", { offer, roomId });
};


  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { candidate: e.candidate, roomId });
      }
    };

    peer.ontrack = (e) => {
  if (remoteRef.current) {
    if (!remoteRef.current.srcObject) {
      remoteRef.current.srcObject = new MediaStream();
    }
    e.streams[0].getTracks().forEach(track => {
      remoteRef.current.srcObject.addTrack(track);
    });
  }
};


    return peer;
  };

  const handleOffer = async ({ offer }) => {
  if (!peerRef.current) {
    peerRef.current = createPeer();
  }

  await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));

  if (localStream.current) {
    // Prevent "sender already exists" error
    localStream.current.getTracks().forEach((track) => {
      const senders = peerRef.current.getSenders();
      const alreadyAdded = senders.find((s) => s.track?.kind === track.kind);
      if (!alreadyAdded) {
        peerRef.current.addTrack(track, localStream.current);
      }
    });
  }

  const answer = await peerRef.current.createAnswer();
  await peerRef.current.setLocalDescription(answer);
  socket.emit("answer", { answer, roomId });
};

  const handleAnswer = async ({ answer }) => {
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = async ({ candidate }) => {
    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };
  const leaveCall = () => {
  // Stop local media tracks
  if (localStream.current) {
    localStream.current.getTracks().forEach(track => track.stop());
  }

  // Close peer connection
  if (peerRef.current) {
    peerRef.current.close();
    peerRef.current = null;
  }

  // Reset video elements
  if (localRef.current) localRef.current.srcObject = null;
  if (remoteRef.current) remoteRef.current.srcObject = null;

  // Leave socket room and disconnect
  socket.emit("leave-room", roomId);
  

  // Reset UI state
  setRoomId("");
  setInputRoomId("");
  setInCall(false);
};
const toggleMic = () => {
  if (localStream.current) {
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMicOn(prev => !prev);
  }
};

const toggleCamera = () => {
  if (localStream.current) {
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsCamOn(prev => !prev);
  }
};



  return (
    <div>
      {!inCall ? (
        <div>
          <button onClick={handleCreateRoom}>Create Meeting</button>
          <input
            type="text"
            placeholder="Enter Meeting ID"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
          />
          <button onClick={() => joinRoom(inputRoomId)}>Join Meeting</button>
        </div>
      ) : (
        <div>
          <p>Meeting ID: {roomId}</p>
<div style={{ display: "flex", gap: "20px" }}>
  <video ref={localRef} autoPlay muted playsInline style={{ width: "300px" }} />
  <video ref={remoteRef} autoPlay playsInline style={{ width: "300px" }} />
</div>
<br />
<button onClick={leaveCall} style={{ background: "red", color: "white" }}>
  Leave Meeting
</button>
<button onClick={toggleMic}>
  {isMicOn ? "Mute Mic" : "Unmute Mic"}
</button>
<button onClick={toggleCamera}>
  {isCamOn ? "Turn Off Camera" : "Turn On Camera"}
</button>



        </div>
      )}
    </div>
  );
};

export default LiveSession;
