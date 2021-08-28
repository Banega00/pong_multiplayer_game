import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose'
import { PlayerModel } from './schemas/player';

dotenv.config();

(async function main() {
    try {
        const app = express();
        app.use(express.static('public'))

        await mongoose.connect('mongodb+srv://bane:sifrasifra@cluster0.xxfox.mongodb.net/pong_multiplayer_db?retryWrites=true&w=majority');
        console.log('Connecting with database successful')

        // const playerDocument = new PlayerModel({
        //     name: 'player1'
        // })

        // await playerDocument.save();

        const PORT = process.env.PORT;
        app.listen(PORT, () => {
            console.log(`Server is started at port: ${PORT}`)
        })
    } catch (err) {
        console.log(err);
        process.exit(-1)
    }
})();



