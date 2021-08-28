import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose'
import { AppController } from './app-controller';
import bodyParser from 'body-parser';

dotenv.config();

(async function main() {
    try {
        const app = express();
        app.use(express.static('public'))
        app.use(bodyParser.json());

        await mongoose.connect('mongodb+srv://bane:sifrasifra@cluster0.xxfox.mongodb.net/pong_multiplayer_db?retryWrites=true&w=majority');
        console.log('Connecting with database successful')

        app.post('/login', AppController.loginPlayer)

        const PORT = process.env.PORT;
        app.listen(PORT, () => {
            console.log(`Server is started at port: ${PORT}`)
        })
    } catch (err) {
        console.log(err);
        process.exit(-1)
    }
})();



