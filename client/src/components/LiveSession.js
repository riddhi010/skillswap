import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL = "https://skillswap-backend-jxyu.onrender.com"; 

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

const LiveSession = ({ username, roomId }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join-room", { roomId, username });

    socketRef.current.on("user-joined", ({ userId, username: otherUser, isInitiator }) => {
      console.log("User joined:", userId, otherUser, isInitiator);

      if (isInitiator) {
        createPeerConnection();
      }
    });

    socketRef.current.on("offer", async ({ sdp, caller }) => {
      console.log("Offer received");
      if (!peerConnectionRef.current) createPeerConnection();

      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit("answer", {
        sdp: peerConnectionRef.current.localDescription,
        responder: socketRef.current.id,
        target: caller,
      });
    });

    socketRef.current.on("answer", async ({ sdp, responder }) => {
      console.log("Answer received");
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    });

    socketRef.current.on("chat-message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        if (peerConnectionRef.current) {
          stream.getTracks().forEach((track) => {
            peerConnectionRef.current.addTrack(track, stream);
          });
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
      });

    // Clean up on unmount
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, username]);

  function createPeerConnection() {
    peerConnectionRef.current = new RTCPeerConnection(configuration);

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          target: null, // Send to all or specific? We'll handle below
        });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Add local tracks to peer connection
    const localStream = localVideoRef.current.srcObject;
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStream);
      });
    }

    // Initiator creates offer and sends it
    peerConnectionRef.current.onnegotiationneeded = async () => {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        socketRef.current.emit("offer", {
          sdp: peerConnectionRef.current.localDescription,
          caller: socketRef.current.id,
          target: null, // Broadcast or specific peer needed - this needs room logic in backend and frontend
        });
      } catch (err) {
        console.error(err);
      }
    };
  }

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      socketRef.current.emit("chat-message", { roomId, message: chatInput });
      setMessages((prev) => [...prev, { sender: username, message: chatInput }]);
      setChatInput("");
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Live Session - Room: {roomId}</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "300px", border: "1px solid black" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "300px", border: "1px solid black" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Chat</h3>
        <div
          style={{
            border: "1px solid #ddd",
            height: "150px",
            overflowY: "scroll",
            padding: "5px",
          }}
        >
          {messages.map((msg, i) => (
            <p key={i}>
              <b>{msg.sender}:</b> {msg.message}
            </p>
          ))}
        </div>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>
    </div>
  );
};

export default LiveSession;
