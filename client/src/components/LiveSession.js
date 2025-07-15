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

    const startCall = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (localVideo.current) localVideo.current.srcObject = mediaStream;

        peerConnection.current = new RTCPeerConnection(config);

        mediaStream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, mediaStream);
        });

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
        console.error("Media error:", err);
      }
    };

    startCall();
  }, [inCall]);

  useEffect(() => {
    socket.on("room-created", () => {
      console.log("Room created. Waiting for peer...");
    });

    socket.on("room-joined", () => {
      console.log("Room joined. Waiting for peer to join.");
    });

    socket.on("peer-joined", async (id) => {
      console.log("Peer joined:", id);
      setRemoteSocketId(id);

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", {
        target: id,
        sdp: offer,
      });
    });

    socket.on("offer", async ({ sdp, caller }) => {
      console.log("Received offer from:", caller);
      setRemoteSocketId(caller);

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        target: caller,
        sdp: answer,
      });
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("Received answer");
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await peerConnection.current.addIceCandidate(candidate);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    });

    socket.on("peer-disconnected", () => {
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
