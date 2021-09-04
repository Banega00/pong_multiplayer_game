import * as dotenv from 'dotenv';
import * as express from 'express';
import * as mongoose from 'mongoose'
import { AppController } from './app-controller';
import * as bodyParser from 'body-parser';
import { Server, Socket } from "socket.io";

dotenv.config();

const app = express();
app.use(express.static('public'))
app.use(bodyParser.json());

app.post('/login', AppController.loginPlayer)

export const App = app;



