import { Request, Response } from "express";
import { PlayerModel } from "./schemas/player";

export class AppController {

    public static async loginPlayer(request: Request, response: Response) {
        const name = request.body.name;
        if (!name) response.status(400).json({ message: "Player name is required!" })
        try {
            const player = await PlayerModel.findOne({ name: name })

            if (player) return response.status(200).json({ message: "Successful, player exists!" })
            else {
                const playerDocument = new PlayerModel({
                    name: 'player1'
                })
                await playerDocument.save();
                return response.status(200).json({ message: "Successful, new player saved!" })
            }
        } catch (error) {
            return response.status(500).json({ message: "Error querying player", error })
        }
    }
}