import React, { useEffect, useState, useRef, useCallback } from "react";


import { useNavigate, useParams } from "react-router-dom"; 
import rtcpeer from "../../service/rtcpeer"; 
import { useSocket } from "../../context/SocketProvider"; 
import { AlreadyExistPayload,
         AnswerPayload, 
         JoinRoomPayload, 
         OfferPayload } from "../../Type/type"

const Room: React.FC = ()=> {

  const navigate = useNavigate();
 
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [incommingCall,setIncommingCall] = useState<Boolean>(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const { roomId } = useParams<{ roomId: string }>(); 
  const [connectedCall,setConnectedCall] = useState<boolean>(false);
  const socket = useSocket(); 

  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream; 
      }

      setLocalStream(stream); 
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const sendStream = useCallback(() => {
    if (localStream && rtcpeer && rtcpeer.peer) {
      console.log("adding stream to localstream");
      for (const track of localStream.getTracks()) {
        rtcpeer.peer.addTrack(track, localStream);
      }
      setConnectedCall(true); 
    }
  }, [localStream]);

  const handleCall = useCallback(async () => {
    await rtcpeer.setupConnection();
    
    const offer = await rtcpeer.getOffer();
    socket?.emit("offer", { to: remoteSocketId, offer });
    console.log("create offer and sending: ", offer);
  }, [rtcpeer, remoteSocketId]);

  const handleOffer = useCallback(async ({ from, offer }:OfferPayload) => {
    console.log("got offer: ", offer);
    const answer = await rtcpeer.getAnswer(offer);
    console.log("sending answer: ", answer);
    socket?.emit("answer", { to: from, answer });
    setIncommingCall(true);
  }, [rtcpeer,socket]);

  const handleAnswer = useCallback(async ({ answer }:AnswerPayload) => {
    console.log("got answer: ", answer);
    await rtcpeer.setRemote(answer);
    sendStream();
  }, [rtcpeer,localStream]);

  const handleJoinRoom = useCallback(({ from }:JoinRoomPayload) => {
    setRemoteSocketId(from);
    socket?.emit("alreadyExist", { to: from });
  }, []);

  const handleAlreadyExist = useCallback(({ from }:AlreadyExistPayload) => {
    console.log("remote socket id: ", from);
    setRemoteSocketId(from);
  }, []);

  const negotiationHandle = useCallback(async () => {
    const offer = await rtcpeer.getOffer();
    socket?.emit("offer", { offer, to: remoteSocketId });
  }, [rtcpeer, remoteSocketId]);

  const handleTrack = useCallback((event:RTCTrackEvent) => {
    let upcomingStream = event.streams[0];
    console.log("upcoming stream: ", upcomingStream);
   
    setRemoteStream(upcomingStream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = upcomingStream;
    }
  }, []);

  const handleEndCall = () => {
  rtcpeer.closeConnection();  
  setConnectedCall(false);
  setIncommingCall(false);
  setRemoteStream(null);
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }
  socket?.emit("end-call", { to: remoteSocketId });
  navigate("/")
};

  const handleEndCallEvent = () => {
    // rtcpeer.closeConnection();  
  setConnectedCall(false);
  setIncommingCall(false);
  setRemoteStream(null);
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }
   navigate("/");
  };

  useEffect(() => {
    if (!localStream) {
      initLocalStream();
    }

    socket?.on("join:room", handleJoinRoom);
    socket?.on("alreadyExist", handleAlreadyExist);
    socket?.on("offer", handleOffer);
    socket?.on("answer", handleAnswer);
    socket?.on("end-call", handleEndCallEvent);
    rtcpeer?.peer?.addEventListener("track", handleTrack);
    rtcpeer?.peer?.addEventListener("negotiationneeded", negotiationHandle);

    return () => {

      socket?.off("join:room", handleJoinRoom);
      socket?.off("alreadyExist", handleAlreadyExist);
      socket?.off("offer", handleOffer);
      socket?.off("answer", handleAnswer);
      socket?.off("end-call", handleEndCallEvent);
      rtcpeer?.peer?.removeEventListener("track", handleTrack);
      rtcpeer?.peer?.removeEventListener("negotiationneeded", negotiationHandle);

    };
  }, [
    localStream,
    initLocalStream,
    handleJoinRoom,
    handleAlreadyExist,
    handleOffer,
    handleAnswer,
    handleTrack,
    negotiationHandle
  ])


  return (

       <div className="h-screen w-screen bg-cyan-800 flex justify-center items-center">
      <div className="w-[80%] md:w-[60%] h-[70%] md:h-[65%]  flex flex-col justify-between">
        <div className="flex justify-center items-center gap-4 flex-col  h-[20%]">
         
          {
            !remoteSocketId ? 
            (<h1 className="text-xl text-red-800 font-bold">
              No user in This Room
            </h1>)
            :
           connectedCall ? (
            <button onClick={handleEndCall} className="bg-red-500 px-5 py-2 rounded-xl">
              End Call
            </button>
          ) : incommingCall ? (
            <button className="bg-blue-500 px-5 py-2 rounded-xl" onClick={sendStream}>
              Accept
            </button>
          ) : (
            <button className="bg-blue-500 px-5 py-2 rounded-xl" onClick={handleCall}>
              Call
            </button>
          )

          }
        </div>
        <div className="h-[80%] grid  grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
          <div className="flex flex-col h-full w-full ">
            <div className="h-[20%] flex items-center justify-center ">
              <h1 className="text-white">my video</h1>
            </div>
            <div className="h-[80%]  border-blue-500 border-2">
              <video autoPlay className="h-full w-full object-cover" ref={localVideoRef}></video>
            </div>
          </div>
          <div className="flex flex-col h-full w-full ">
            <div className="h-[20%] flex justify-center items-center ">
              <h1 className="text-white">remote video</h1>
            </div>
            <div className="h-[80%] border-blue-500 border-2">
              <video autoPlay className="h-full w-full object-cover" ref={remoteVideoRef}></video>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    
  )
};


export default Room;
