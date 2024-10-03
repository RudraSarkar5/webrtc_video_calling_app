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
        socket.join(room);
        socket.broadcast.to(room).emit("join:room", { from: socket.id });
    });

    // if already any client exist in this room
    socket.on("alreadyExist",({to})=>{
        io.to(to).emit("alreadyExist", { from: socket.id });
    }); 

    //client send offer
    socket.on("offer", ({ to, offer }) => {
         io.to(to).emit("offer", { from: socket.id, offer });
    });

    // handle answer
    socket.on("answer", ({ to, answer }) => {
        io.to(to).emit("answer", {answer});
    });

     // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });


})