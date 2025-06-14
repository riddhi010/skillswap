import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SERVER_URL = "https://skillswap-backend-jxyu.onrender.com"; 

const LiveSession = ({ username, roomId }) => {
  const [socket, setSocket] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null);
  const localRef = useRef();
  const remoteRef = useRef();
  const pcRef = useRef(new RTCPeerConnection());
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sock = io(SERVER_URL);
    setSocket(sock);

    sock.emit("join-room", { roomId, username });

    sock.on("user-joined", async ({ userId, username: peerName, isInitiator }) => {
      setRemoteUser({ id: userId, name: peerName });

      if (isInitiator) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localRef.current.srcObject = stream;

        stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        sock.emit("offer", { sdp: offer, caller: sock.id, target: userId });
      }
    });

    sock.on("offer", async ({ sdp, caller }) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      sock.emit("answer", { sdp: answer, responder: sock.id, target: caller });
    });

    sock.on("answer", async ({ sdp }) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    sock.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate && remoteUser) {
        sock.emit("ice-candidate", {
          candidate: e.candidate,
          target: remoteUser.id,
        });
      }
    };

    pcRef.current.ontrack = (event) => {
      remoteRef.current.srcObject = event.streams[0];
    };

    sock.on("chat-message", ({ sender, message }) => {
      setChatMessages((prev) => [...prev, { sender, message }]);
    });

    sock.on("user-left", ({ userId, username }) => {
      setRemoteUser(null);
      if (remoteRef.current.srcObject) {
        remoteRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      remoteRef.current.srcObject = null;
    });

    return () => {
      sock.emit("leave-room", { roomId, username });
      pcRef.current.close();
      sock.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("chat-message", { roomId, message });
      setChatMessages((prev) => [...prev, { sender: "You", message }]);
      setMessage("");
    }
  };

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">🔴 Live Session in Room: {roomId}</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <p className="mb-2">🎥 Your Video</p>
          <video ref={localRef} autoPlay muted playsInline width="300" />
        </div>
        <div>
          <p className="mb-2">🧍‍♂️ Remote Video</p>
          <video ref={remoteRef} autoPlay playsInline width="300" />
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded shadow-lg max-w-md">
        <h3 className="font-semibold mb-2">💬 Chat</h3>
        <div className="h-40 overflow-y-auto border p-2 mb-2">
          {chatMessages.map((msg, i) => (
            <div key={i}>
              <strong>{msg.sender}: </strong>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            className="flex-1 rounded p-1 text-black"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="ml-2 bg-teal-500 px-3 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
