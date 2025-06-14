import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "https://skillswap-backend-jxyu.onrender.com";

const LiveSession = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const createPeerConnection = useCallback(async () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    peerConnection.current = new RTCPeerConnection(servers);
    console.log("🌐 New RTCPeerConnection created");

    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }

    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.ontrack = (event) => {
      console.log("🎥 ontrack triggered:", event);
      if (remoteVideoRef.current) {
        if (!remoteVideoRef.current.srcObject) {
          const remoteStream = new MediaStream();
          remoteStream.addTrack(event.track);
          remoteVideoRef.current.srcObject = remoteStream;
        } else {
          remoteVideoRef.current.srcObject.addTrack(event.track);
        }
        remoteVideoRef.current.play().catch((e) => console.warn("Autoplay blocked:", e));
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        console.log("❄️ Sending ICE candidate:", event.candidate);
        socket.emit("ice-candidate", {
          target: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      console.log("✅ PC connection state:", peerConnection.current.connectionState);
    };
  }, [remoteSocketId, socket]);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("user-joined", async ({ userId, username: newUser, isInitiator }) => {
      console.log("👥 User joined:", userId);
      setRemoteSocketId(userId);
      setChatMessages((prev) => [...prev, { sender: "System", message: `${newUser} joined the room.` }]);

      if (!peerConnection.current) await createPeerConnection();

      if (isInitiator) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        console.log("📨 Sending offer to:", userId);
        socket.emit("offer", {
          target: userId,
          caller: socket.id,
          sdp: offer,
        });
      }
    });

    socket.on("offer", async ({ sdp, caller }) => {
      console.log("📨 Offer received from:", caller);
      setRemoteSocketId(caller);
      if (!peerConnection.current) await createPeerConnection();

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      console.log("📨 Sending answer to:", caller);
      socket.emit("answer", {
        target: caller,
        responder: socket.id,
        sdp: answer,
      });
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("📩 Answer received from responder");
      if (peerConnection.current.signalingState === "have-local-offer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("❄️ ICE candidate received:", candidate);
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("🚨 Error adding ICE candidate", e);
      }
    });

    socket.on("chat-message", ({ sender, message }) => {
      setChatMessages((prev) => [...prev, { sender, message }]);
    });

    socket.on("user-left", ({ username }) => {
      setChatMessages((prev) => [...prev, { sender: "System", message: `${username} left the room.` }]);
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");
      socket.off("user-left");
    };
  }, [socket, createPeerConnection]);

  const joinRoom = async () => {
    if (!roomId || !username) return alert("Enter both Room ID and Username");
    setJoined(true);
    console.log("🚪 Joining room:", roomId);
    await createPeerConnection();
    socket.emit("join-room", { roomId, username, isInitiator: true });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit("leave-room", { roomId, username });
      console.log("🚪 Leaving room:", roomId);
      setJoined(false);
      setRoomId("");
      setUsername("");
      setChatMessages([]);
      setRemoteSocketId(null);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const sendMessage = () => {
    if (message.trim() === "") return;
    console.log("💬 Sending message:", message);
    socket.emit("chat-message", { roomId, message });
    setChatMessages((msgs) => [...msgs, { sender: "Me", message }]);
    setMessage("");
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      {!joined ? (
        <>
          <input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            placeholder="Enter Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={joinRoom} style={{ marginLeft: 10 }}>
            Join Session
          </button>
        </>
      ) : (
        <>
          <h3>Room: {roomId}</h3>
          <button onClick={leaveRoom} style={{ marginBottom: 10 }}>Leave Session</button>
          <div style={{ display: "flex", gap: 10 }}>
            <div>
              <p>You (local):</p>
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: 300, border: "1px solid black" }} />
            </div>
            <div>
              <p>Remote:</p>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300, border: "1px solid black" }} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <h4>Chat</h4>
            <div style={{
              border: "1px solid gray",
              height: 150,
              overflowY: "scroll",
              padding: 10,
              marginBottom: 10,
            }}>
              {chatMessages.map((msg, idx) => (
                <p key={idx}><b>{msg.sender}:</b> {msg.message}</p>
              ))}
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveSession;
