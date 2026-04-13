import express from "express";
import { createServer } from "node:http";

import {Server} from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

const port = process.env.PORT || 8000;
app.set("port", port);
app.use(cors());


app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));

app.get("/", (req, res) => {
  res.send("JOINFY Backend is Live 🚀");
});
app.use("/api/v1/users",userRoutes);


const start = async()=>{
    await mongoose.connect("mongodb+srv://nemaayush22_db_user:Ayushnema@videoconfrence.lx47sxb.mongodb.net/videoconfrence");

    server.listen(app.get("port"),()=>{

       
    });
}
start();