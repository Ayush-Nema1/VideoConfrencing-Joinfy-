import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};
let transcripts = {};


export const connectToSocket = (server) => {
const io = new Server(server,{
     cors :{
        origin: "*",
        methods: ["GET" , "POST"],
        allowHeaders : ["*"],
        credentials : true
     }
});


    

  io.on("connection", (socket) => {
   
     console.log("New connection:", socket.id);
    
    socket.onAny((event, ...args) => {
        console.log("Event received:", event, args); // ← har event print hoga
    });
    
    socket.on("join-call", (path) => {
        console.log("=== JOIN CALL ===");
    console.log("Path:", path);
    console.log("Messages for this room:", messages[path]);
    console.log("Transcripts for this room:", transcripts[path]);
      socket.room = path;
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);

if(transcripts[path] && transcripts[path].length > 0){
 console.log("Sending old transcript:", transcripts[path])
 io.to(socket.id).emit("previous-transcripts", transcripts[path])
}
console.log(transcripts);
      timeOnline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }
      if (messages[path] === undefined) {
    messages[path] = [];    // initialize empty array
} else {
    // send old messages
for (let a = 0; a < messages[path].length; ++a) {
    io.to(socket.id).emit(
        "chat-message",
        messages[path][a].data,           // data
        messages[path][a].sender,          // sender
        messages[path][a]["socket-id-sender"]  // socketId
    );
}
}

    });
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );
      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
        console.log("message", matchingRoom, ":", sender, data);

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }

    });
          socket.on("audio-transcript", (data) => {

 const room = socket.room;

 if(!transcripts[room]){
   transcripts[room] = [];
 }

 transcripts[room].push({
   sender: data.sender,
   text: data.text,
   time: new Date()
 });

 console.log("Transcript:", transcripts[room]);

});

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());

      var key;

      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;

            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }

            var index = connections[key].indexOf(socket.id);

            connections[key].splice(index, 1);

            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });
  return io;
};
