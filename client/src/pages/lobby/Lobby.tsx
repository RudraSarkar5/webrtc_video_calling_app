import React, { useState } from "react";
import {  useSocket } from "../../context/SocketProvider"; 
import { useNavigate } from "react-router-dom";
import { SocketContextType } from "../../Type/type";


const Lobby: React.FC = () => {

  const [room, setRoom] = useState<string>("");
 
  const socket:SocketContextType = useSocket(); 

  const navigate = useNavigate();

  const handleJoin = () => {
      if ( room.length < 1){
        alert("please set room Id")
        return;
      }
      console.log("room is : ",room); 
      socket?.emit("join:room",room);
      navigate(`/room/${room}`); 
  };

  return (

    <div className=" h-screen w-screen text-white bg-slate-500 flex justify-center items-center" >
      <div className=" h-56 w-96 bg-slate-700 flex justify-center items-center flex-col gap-3">
            <h1 className="text-xl">Join a Room</h1>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)} 
              type="text"
              className="text-black p-2"
              placeholder="Room ID"
            />
            <button className="bg-blue-500 px-5 py-2 rounded-xl" onClick={handleJoin}>Join</button> 
      </div>
      
    </div>
    
  );
};

export default Lobby;
