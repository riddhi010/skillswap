import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// production backend URL
const socket = io("https://skillswap-backend-jxyu.onrender.com", {
  transports: ["websocket"],
});

const LiveSession = () => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const [stream, setStream] = useState(null);

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!inCall) return;

    const start = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);
        if (localVideo.current) localVideo.current.srcObject = userStream;

        peerConnection.current = new RTCPeerConnection(config);

        userStream.getTracks().forEach((track) =>
          peerConnection.current.addTrack(track, userStream)
        );

        peerConnection.current.ontrack = (event) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate && remoteSocketId) {
            socket.emit("ice-candidate", {
              target: remoteSocketId,
              candidate: event.candidate,
            });
          }
        };

        socket.emit("join-room", roomId);
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    start();
  }, [inCall]);

  useEffect(() => {
    socket.on("room-created", () => {
      console.log("Room created. Waiting for peer...");
    });

    socket.on("room-joined", () => {
      console.log("Room joined. Waiting for offer...");
    });

    socket.on("peer-joined", (id) => {
      console.log("Peer joined:", id);
      setRemoteSocketId(id);
      createOffer(id); // Only after we have the peer's socket ID
    });

    socket.on("offer", async ({ sdp, caller }) => {
      setRemoteSocketId(caller);
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
        console.error("Error adding ICE candidate:", e);
      }
    });

    socket.on("peer-disconnected", () => {
      if (remoteVideo.current) remoteVideo.current.srcObject = null;
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createOffer = async (targetId) => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { target: targetId, sdp: offer });
  };

  const leaveCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    setInCall(false);
    socket.disconnect();
  };

  return (
    <div>
      {!inCall ? (
        <div>
          <input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={() => setInCall(true)}>Join Call</button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <video
              ref={localVideo}
              autoPlay
              playsInline
              muted
              style={{ width: 300, border: "2px solid black", borderRadius: "8px" }}
            />
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              style={{ width: 300, border: "2px solid black", borderRadius: "8px" }}
            />
          </div>
          <button onClick={leaveCall} style={{ marginTop: "12px" }}>
            Leave Call
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveSession;
