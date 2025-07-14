import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://skillswap-backend-jxyu.onrender.com", {
  transports: ["websocket"]
});


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
  const isOfferer = useRef(false);

  useEffect(() => {
    socket.on("user-joined", () => {
      console.log("User joined, starting call as offerer");
      if (isOfferer.current && !peerRef.current) {
        callUser();
      }
    });

    socket.on("offer", async ({ offer }) => {
      console.log("Received offer");
      if (!peerRef.current) createPeerConnection();

      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("answer", { answer, roomId });
    });

    socket.on("answer", async ({ answer }) => {
      console.log("Received answer");
      if (peerRef.current.signalingState === "stable") return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        console.log("Received ICE candidate");
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding received ICE candidate", e);
      }
    });

    socket.on("user-left", () => {
      console.log("User left the room");
      endCall();
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [roomId]);

 const createPeerConnection = () => {
  peerRef.current = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efJQy92g1Zyb7VNaYq7Z8g==",
      credential: "kF1Wh5H8iIWNoYV1"
    }
  ]
});



  peerRef.current.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", { candidate: event.candidate, roomId });
    }
  };

   peerRef.current.oniceconnectionstatechange = () => {
  console.log("ICE connection state:", peerRef.current.iceConnectionState);
};


 peerRef.current.ontrack = (event) => {
  console.log("🔵 Received remote track");
  const remoteStream = new MediaStream();
  remoteStream.addTrack(event.track);
  remoteRef.current.srcObject = remoteStream;
};



  if (localStream.current) {
    localStream.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, localStream.current);
    });
  }
};


  const callUser = async () => {
    if (!peerRef.current) {
      createPeerConnection();
    }
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit("offer", { offer, roomId });
  };

  const joinRoom = async (id) => {
    if (!id) return alert("Please enter a meeting ID");
    setRoomId(id);
    setInCall(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current.srcObject = stream;
      localStream.current = stream;

      // Check if room already exists to set offerer flag
      socket.emit("check-room", id, (roomExists) => {
        isOfferer.current = !roomExists;
        socket.emit("join-room", id);
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access camera/mic. Please allow permissions.");
      setInCall(false);
    }
  };

  const handleCreateRoom = () => {
    const id = Math.random().toString(36).substring(2, 10);
    joinRoom(id);
  };

  const leaveCall = () => {
    socket.emit("leave-room", roomId);
    endCall();
  };

  const endCall = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;

    setRoomId("");
    setInputRoomId("");
    setInCall(false);
    setIsMicOn(true);
    setIsCamOn(true);
  };

  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCamOn((prev) => !prev);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {!inCall ? (
        <div>
          <button onClick={handleCreateRoom}>Create Meeting</button>
          <input
            type="text"
            placeholder="Enter Meeting ID"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            style={{ marginLeft: 10 }}
          />
          <button onClick={() => joinRoom(inputRoomId)} style={{ marginLeft: 10 }}>
            Join Meeting
          </button>
        </div>
      ) : (
        <div>
          <p>
            Meeting ID: <b>{roomId}</b>
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <video
              ref={localRef}
              autoPlay
              muted
              playsInline
              style={{ width: "300px", border: "2px solid green", borderRadius: "8px" }}
            />
            <video
              ref={remoteRef}
              autoPlay
              playsInline
              style={{ width: "300px", border: "2px solid blue", borderRadius: "8px" }}
            />
          </div>
          <br />
          <button onClick={leaveCall} style={{ background: "red", color: "white", padding: "8px 16px" }}>
            Leave Meeting
          </button>
          <button onClick={toggleMic} style={{ marginLeft: "10px", padding: "8px 16px" }}>
            {isMicOn ? "Mute" : "Unmute"}
          </button>
          <button onClick={toggleCamera} style={{ marginLeft: "10px", padding: "8px 16px" }}>
            {isCamOn ? "Turn Off Camera" : "Turn On Camera"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveSession;
