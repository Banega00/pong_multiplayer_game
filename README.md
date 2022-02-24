# Pong Multiplayer Game
This project is part of University course called "Computer Networks", attended at 5th semester of Undergraduate studies at University of Belgrade, Faculty of Organizational Sciences.

This is **real-time multiplayer** game, where two players plays against each other trying to keep ball inside a gamefield.

Game is deployed using **Heroku** platform.

Here is [LINK TO GAME](https://pong-multiplayer-game-rmt.herokuapp.com/login.html) - ENJOY!



# Gameplay

1. First a player needs to "log in" - providing **username**
   
   <img src="https://user-images.githubusercontent.com/44339816/134213230-1e6e9e7b-09bc-4265-be50-bf07cd53d0df.png" width="300">
2. After submiting username, player enters the lobby where the other online players are waiting for the game
   
   <img src="https://user-images.githubusercontent.com/44339816/134214119-8c418348-4334-49e5-9d18-baad25b68c35.png" width="300">
3. The player can use chat to communicate with other online players
4. The player can also invite other player who is online for a game, by clicking play button next to player name
   
   <img src="https://user-images.githubusercontent.com/44339816/134214632-33826106-dc2a-4810-a9a1-357badee394e.png" width="300">
5. Player who gets the invate is prompted with accept/decline box with a timer
6. If opponent player accepts game invitation, both players will gets notification that game is about to start in 5 sec - afterwhich game window will be opened.
  <img src="https://user-images.githubusercontent.com/44339816/134214962-5dbf63d1-4279-4295-8f4f-4b1821c7c9aa.png" width="450">

7. Player who initialized the game request can configure game wining points, and game timer, also both players are able to choose their colors
8. When both players press ready button - game is started and ball will start to move
   
   <img src="https://user-images.githubusercontent.com/44339816/134215538-f4b9df48-19ed-4e92-ab8b-4270a4c368ba.png" width="450">

9.  Game is over when one of the players reach winning points limit or when time runs out
    
    <img src="https://user-images.githubusercontent.com/44339816/134215712-dba7edc4-c29c-44f5-8f7a-8832b3e8c744.png" width="450">
10. By clicking "Back to lobby" button players are returned to lobby and ready for new game!

# Implementation
Game follows client-server paradigm.

Client side is implemented using classic web technologies - **HTML**, **CSS** and **Javascript**. Also, **socket.io-client** library is used to connect client with socket on server side.

Server is implemented using NodeJS runtime. Most important libraries are: 
* **express** 
* **mongoose**
* **socket.io**.
