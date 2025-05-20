import express, { Express } from "express"
import dotenv from "dotenv"
import cors from "cors"
import router from "./routers/router"
import corsOptions from "./configs/cors"
import cookieParser from 'cookie-parser'
dotenv.config()
import http from "http";
import { initializeSocket } from "./socket/socket"

const App: Express = express()
const Port = process.env.PORT 

App.set("trust proxy", 1)
App.use(express.json())
App.use(cors(corsOptions))
App.use(cookieParser());


const server = http.createServer(App);


initializeSocket(server)

App.use("/api/v1", router);

server.listen(Port, () => {
    console.log(`Server running on http://localhost:${Port}`)
})

App.set('trust proxy', true)



