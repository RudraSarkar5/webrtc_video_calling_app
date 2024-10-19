import { Server } from "socket.io";


const PORT = 8000;



const io  = new Server(PORT,{
    cors : {
        origin : "*"
    }
})

io.on("connection",(socket)=>{

    console.log("user connected : ",socket.id);

     // join call room
    socket.on("join:room",(room)=>{
        console.log("enter ");
        
        console.log("join room here : ",room);
        socket.join(room);
        socket.broadcast.to(room).emit("join:room", { from: socket.id });
    });

    // if already any client exist in this room
    socket.on("alreadyExist",({to})=>{
        io.to(to).emit("alreadyExist", { from:socket.id });
    }); 

    //client send offer
    socket.on("offer", ({ to, offer }) => {
        console.log("in offer socket ", socket.id);
         io.to(to).emit("offer", { from:socket.id, offer });
    });

    socket.on("negoOffer", ({ room, offer }) => {
         
         socket.broadcast.to(room).emit("negoOffer", {from:socket.id,  offer });
    });
    socket.on("handleNegoAnswer", ({ to, answer }) => {
         
        io.to(to).emit("handleNegoAnswer", { answer });
    });

    // handle answer
    socket.on("answer", ({ to, answer }) => {
        io.to(to).emit("answer", {answer});
    });
    socket.on("candidate", ({  candidate,room }) => {
        socket.broadcast.to(room).emit("answer", {candidate});
    });

    socket.on("end-call", ({  to }) => {
        io.to(to).emit("end-call", {from:socket.id});
    });

     // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });


})

