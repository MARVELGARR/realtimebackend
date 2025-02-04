import express, { Express } from "express"
import dotenv from "dotenv"
import cors from "cors"
import router from "./routers/router"
import corsOptions from "./configs/cors"
import cookieParser from 'cookie-parser'
dotenv.config()

const App: Express = express()
const Port = process.env.PORT || 3030

App.set("trust proxy", 1)
App.use(express.json())
App.use(cors(corsOptions))
App.use(cookieParser());


App.use("/api/v1", router);

App.listen(Port, () => {
    console.log(`Server running on http://localhost:${Port}`)
})

App.set('trust proxy', true)



