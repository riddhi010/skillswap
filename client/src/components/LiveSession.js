import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://skillswap-backend-jxyu.onrender.com", {
  transports: ["websocket"],
});

const LiveSession = () => {
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState(null);

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const localStream = useRef(null);
  const remoteMediaStream = useRef(new MediaStream());
  const peerRef = useRef(null);
  const isOfferer = useRef(false);
  const iceQueue = useRef([]);

  useEffect(() => {
    socket.on("user-joined", ({ userId }) => {
      console.log("📥 User joined:", userId);
      setRemoteUserId(userId);
      if (isOfferer.current && !peerRef.current) {
        createPeerConnection();
        makeOffer(userId);
      }
    });

    socket.on("offer", async ({ sdp, caller }) => {
      console.log("📥 Received offer");
      setRemoteUserId(caller);
      createPeerConnection();
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("✅ Remote description set from offer");

      while (iceQueue.current.length) {
        const candidate = iceQueue.current.shift();
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added from queue");
      }

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("answer", {
        sdp: answer,
        responder: socket.id,
        target: caller,
      });
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("📥 Received answer");
      if (peerRef.current.signalingState !== "stable") {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("✅ Remote description set from answer");

        while (iceQueue.current.length) {
          const candidate = iceQueue.current.shift();
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ ICE candidate added from queue");
        }
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("📥 ICE candidate received");
      if (peerRef.current && peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added immediately");
      } else {
        iceQueue.current.push(candidate);
        console.log("⏳ ICE candidate queued");
      }
    });

    socket.on("user-left", () => {
      console.log("👋 User left");
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
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate && remoteUserId) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          target: remoteUserId,
        });
      }
    };

    peerRef.current.ontrack = (event) => {
      console.log("🔵 Remote track received:", event.track.kind);

      const stream = remoteMediaStream.current;
      const alreadyExists = stream.getTracks().some(
        (t) => t.id === event.track.id
      );

      if (!alreadyExists) {
        stream.addTrack(event.track);
        console.log("✅ Track added to remote stream");
      }

      const assignStreamToVideo = () => {
        const video = remoteRef.current;
        if (!video) {
          console.warn("⏳ remoteRef not ready, retrying...");
          setTimeout(assignStreamToVideo, 50);
          return;
        }
        if (!video.srcObject) {
          video.srcObject = remoteMediaStream.current;
          console.log("✅ Remote stream assigned to video element");
        }
      };

      assignStreamToVideo();
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, localStream.current);
      });
    }
  };

  const makeOffer = async (targetId) => {
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit("offer", {
      sdp: offer,
      caller: socket.id,
      target: targetId,
    });
  };

  const joinRoom = async (id) => {
    if (!id) {
      alert("Please enter a meeting ID");
      return;
    }

    try {
      console.log("🎥 Requesting media access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localRef.current.srcObject = stream;
      localStream.current = stream;

      console.log("✅ Local media stream ready");

      setRoomId(id);
      setInCall(true);

      socket.emit("check-room", id, (roomExists) => {
        isOfferer.current = !roomExists;
        console.log(`📡 Room ${id} exists?`, roomExists);
        socket.emit("join-room", { roomId: id, username: "User" });
      });
    } catch (err) {
      console.error("❌ Error accessing media:", err);
      alert("Camera/Mic access denied or not available.");
    }
  };

  const leaveCall = () => {
    socket.emit("leave-room", { roomId, username: "User" });
    endCall();
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.close();
    peerRef.current = null;
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;
    remoteMediaStream.current = new MediaStream(); // reset remote stream for next call
    setInCall(false);
    setRoomId("");
    setRemoteUserId(null);
  };

  const handleCreateRoom = async () => {
    const id = Math.random().toString(36).substring(2, 10);
    console.log("🆕 Creating room with ID:", id);
    await joinRoom(id);
  };

  return (
    <div>
      {!inCall ? (
        <div>
          <button onClick={handleCreateRoom}>Create Meeting</button>
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button onClick={() => joinRoom(inputRoomId)}>Join</button>
        </div>
      ) : (
        <div>
          <p>Meeting ID: {roomId}</p>

          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "300px",
              border: "2px solid green",
              borderRadius: "8px",
              background: "black",
            }}
          />

          <video
            ref={remoteRef}
            autoPlay
            playsInline
            style={{
              width: "300px",
              border: "2px solid blue",
              borderRadius: "8px",
              background: "black",
            }}
          />

          <br />
          <button onClick={leaveCall}>Leave</button>
        </div>
      )}
    </div>
  );
};

export default LiveSession;
