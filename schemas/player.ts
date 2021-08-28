import { model, Schema } from 'mongoose'

interface Player {
}

const schema = new Schema<Player>({
    name: { type: String, required: true },
});


export const PlayerModel = model<Player>('Player', schema);
