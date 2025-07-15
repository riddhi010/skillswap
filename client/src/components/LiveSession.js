import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://skillswap-backend-jxyu.onrender.com", {
  transports: ["websocket"],
});

const LiveSession = () => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!inCall) return;

    const initCall = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (localVideo.current) localVideo.current.srcObject = mediaStream;

        peerConnection.current = new RTCPeerConnection(config);

        mediaStream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, mediaStream);
        });

        peerConnection.current.ontrack = async (event) => {
          console.log("🔁 ontrack fired");
          if (event.streams && event.streams[0]) {
            const remoteStream = event.streams[0];
            if (remoteVideo.current) {
              remoteVideo.current.srcObject = remoteStream;
              try {
                await remoteVideo.current.play();
                console.log("✅ Remote video playing");
              } catch (err) {
                console.warn("⚠️ Remote video play failed:", err);
              }
            }
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
        console.error("Media error:", err);
      }
    };

    initCall();
  }, [inCall]);

  useEffect(() => {
    socket.on("room-created", () => {
      console.log("✅ Room created. Waiting for peer...");
    });

    socket.on("room-joined", () => {
      console.log("✅ Room joined. Waiting for peer to join...");
    });

    socket.on("peer-joined", async (id) => {
      console.log("🤝 Peer joined:", id);
      setRemoteSocketId(id);

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", {
        target: id,
        sdp: offer,
      });

      console.log("📤 Offer sent to:", id);
    });

    socket.on("offer", async ({ sdp, caller }) => {
      console.log("📥 Received offer from:", caller);
      setRemoteSocketId(caller);

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("📄 Remote description set (offer)");

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        target: caller,
        sdp: answer,
      });

      console.log("📤 Answer sent back to:", caller);
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("📥 Received answer");
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("📄 Remote description set (answer)");
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await peerConnection.current.addIceCandidate(candidate);
          console.log("❄️ Added ICE candidate");
        } catch (e) {
          console.error("❌ Error adding ICE:", e);
        }
      }
    });

    socket.on("peer-disconnected", () => {
      console.log("🚫 Peer disconnected");
      if (remoteVideo.current) remoteVideo.current.srcObject = null;
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
    setRemoteSocketId(null);
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
              muted // ✅ only during testing; remove later for real audio
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
