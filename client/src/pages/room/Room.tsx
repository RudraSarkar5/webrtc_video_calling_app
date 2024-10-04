import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom"; 
import rtcpeer from "../../service/rtcpeer"; 
import { useSocket } from "../../context/SocketProvider"; 
import { AlreadyExistPayload,
         AnswerPayload, 
         JoinRoomPayload, 
         OfferPayload } from "../../Type/type"

const Room: React.FC = ()=> {
 
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [incommingCall,setIncommingCall] = useState<Boolean>(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const { roomId } = useParams<{ roomId: string }>(); 
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
    }
  }, [localStream]);

  const handleCall = useCallback(async () => {
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

  useEffect(() => {
    if (!localStream) {
      initLocalStream();
    }

    socket?.on("join:room", handleJoinRoom);
    socket?.on("alreadyExist", handleAlreadyExist);
    socket?.on("offer", handleOffer);
    socket?.on("answer", handleAnswer);
    rtcpeer?.peer?.addEventListener("track", handleTrack);
    rtcpeer?.peer?.addEventListener("negotiationneeded", negotiationHandle);

    return () => {

      socket?.off("join:room", handleJoinRoom);
      socket?.off("alreadyExist", handleAlreadyExist);
      socket?.off("offer", handleOffer);
      socket?.off("answer", handleAnswer);
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

    <div className=" h-screen w-screen bg-slate-500   flex flex-col gap-3 justify-center items-center">
       
       <div className=" flex justify-center items-center  w-[100%]">
         {
            incommingCall ? (
              <button className="bg-blue-500 px-5 py-2 rounded-xl" onClick={sendStream}>
                Accept
              </button>
            ) : localStream && remoteSocketId ? (
              <button className="bg-blue-500 px-5 py-2 rounded-xl" onClick={handleCall}>
                Call
              </button>
            ) : (
              <h1 className="text-xl text-red-800 font-bold">
                No user in This Room
              </h1>
            )
          }

       </div>
       <div className="  h-[50%] w-screen text-white   flex flex-col md:flex-row gap-3 justify-center items-center">
          <div className="h-[50%] w-[100%] md:h-[50%] md:w-[50%] flex flex-col items-center md:items-end justify-center">
              <h1 className="text-center md:mr-36">My Stream</h1>
              <div className="h-64  w-[90%]  md:w-96 bg-slate-950">
                  <video ref={localVideoRef} className="w-[100%] object-fill h-[100%]" autoPlay />
              </div>
          </div>
          <div className="  h-[50%]  w-[100%] md:w-[50%] md:h-[50%] flex flex-col items-center md:items-start justify-center">
              <h1 className="md:ml-36 text-center">Remote Stream</h1>
              <div className="h-64 w-[90%] md:w-96  bg-slate-950">
                  <video ref={remoteVideoRef} className="w-[100%] object-fill h-[100%]" autoPlay />
              </div>
          </div>
       </div>
    </div>
    
  )
};


export default Room;
