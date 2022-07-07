import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(); // frontend 에서 보낸 function (Backend에서 실행되지 않음)
    socket.to(roomName).emit("welcome");
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => socket.to(room).emit("bye"));
    });
    socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", msg);
      done();
    });
  });
});
/** socket emit == send , reply == message
 *  disconnecting(아직 안끊김) != disconnect(완전 끊김)
 */

// const wss = new WebSocket.Server({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anonymous";
//     console.log("Connected to Browser ✅");
//     socket.on("close", () => {console.log("Disconnected from Browser ❌");});
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg.toString('utf8'));
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
//             case "nickname":
//                 socket["nickname"] = message.payload;
//         }
//     });
// });

httpServer.listen(3000, handleListen);
