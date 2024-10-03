import React, { useState } from "react";
import { SocketContextType, useSocket } from "../../context/SocketProvider"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";


const Lobby: React.FC = () => {

  const [room, setRoom] = useState<string>("");
 
  const socket:SocketContextType = useSocket(); 

  const navigate = useNavigate();

  const handleJoin = () => {
    if ( room.length < 1){
      alert("please set room Id")
      return;
    }
    if (socket) { 
      socket.emit("join:room", room); 
      navigate(`/call/${room}`); 
    } else {
      console.error("Socket is not connected."); 
      
    }
  };

  return (

    <div className=" h-screen w-screen text-white bg-slate-500 flex justify-center items-center" >
      <div className=" h-56 w-96 bg-slate-700 flex justify-center items-center flex-col gap-3">
            <h1 className="text-xl">Join a Room</h1>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)} 
              type="text"
              placeholder="Room ID"
            />
            <button className="bg-blue-500 px-5 py-2 rounded-xl" onClick={handleJoin}>Join</button> 
      </div>
      
    </div>
    
  );
};

export default Lobby;
