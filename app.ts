import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose'
import { AppController } from './app-controller';
import bodyParser from 'body-parser';
import { Server, Socket } from "socket.io";

dotenv.config();

const app = express();
app.use(express.static('public'))
app.use(bodyParser.json());

app.post('/login', AppController.loginPlayer)

export const App = app;

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is started at port: ${PORT}`)
})



