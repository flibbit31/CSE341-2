/*******************************************************
 * GameLibrary Backend
 * This project should hopefully work with the frontend 
 * project I made in an earlier class, however this project
 * should stand on it's own and conform to the assignment
 * requirements.
 *********************************************************/

//set up
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//make this work with a frontend
/*app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-headers",
        "Origin, X-Requested-Width, Content-Type, Accept, Z-Key"
    );
    //res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
}); */

//get db.js 
const ObjectId = require("mongodb").ObjectId;
const databaseConnect = require("./db.js").databaseConnect;

//set up swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

//set up validation
const { userGameGetSchema, userGameCreateSchema, gameCreateSchema, gameUpdateSchema } = require("./validation_schema");

//set up Google authentication
const { oAuthClient, authURL } = require("./google_setup.js");
const axios = require("axios");

//routes
routes();

async function routes() {
    const client = await databaseConnect();

    //Google login route
    app.get("/auth/", async function (req, res) {
        console.log("auth");
        res.writeHead(301, { "Location": authURL });
        res.send();
    });

    app.get(`${process.env.REDIRECT_URL_WITHOUT}`, async function (req, res) {
        if(req.query.code) {
            const code = req.query.code;
            //console.log(code);

            let { tokens } = await oAuthClient.getToken(code);
            //oAuthClient.setCredentials(tokens); 

            //console.log(tokens);

            /*const profile = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
            //console.log(profile.data);

            //return the profile information to the 

            console.log("Returning data");
            res.status(200).json(profile.data);*/

            res.status(200).json(tokens);
        }

        else if(req.query.error) {
            res.status(403).send(req.query.error);
        }
    });

    //get games by userid
    app.get("/usergames/", async function (req, res) {
        /* #swagger.parameters['add-info'] = {
            in: 'body',
            schema: {
                $access_token: 'adfasdfasdfa'
            }
        }
        */

        try {
            const userGames = await client.db("project2").collection("usergames");

            const token = req.body.access_token;
            const tokenInfo = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
            const userid = tokenInfo.data.sub;

            //const userid = 
            if(userid) {
                const foundDocs = await userGames.find({
                    userid: userid
                })
                .toArray();

                //get games with gameids since only gameid is stored in usergames
                let results = [];
                const games = await client.db("project2").collection("games");
                for(let i = 0; i < foundDocs.length; i++) {
                    const doc = foundDocs[i];
                    console.log(`gameid: ${doc.gameid}`);
                    const foundGames = await games.find({
                        _id: new ObjectId(doc.gameid)
                    })
                    .toArray();
                    //There should be exactly 1 game per gameid
                    if (foundGames.length === 0) {
                        console.log("Error 1");
                        res.status(500).send("gameid did not return any matching games. Database might be malformed.");
                    }

                    else if(foundGames.length > 1) {
                        console.log("Error 2");
                        res.status(500).send("gameid returned more than one matching game. Database might be malformed.");
                    }

                    else {
                        if(foundGames[0] !== null) {
                            console.log(`zero results ${results.length}`);
                            console.log(foundGames[0]);
                            results[i] = foundGames[0];
                            console.log(`first results ${results.length}`);
                        }
                        else {
                            res.status(500).send("gameid returned null result. Database might be malformed.");
                        }
                    }
                      
                }

                console.log("Here");
                console.log(results);
                res.status(200).json(results);
            }

            else {
                res.status(400).send("userid parameter required.");
            }
        }
        catch(e) {
            res.status(500).send(e.message);
        }
    });

    app.get("/games/:gameid", async function (req, res) {
        try {
            const games = await client.db("project2").collection("games");
            const gameid = new ObjectId(req.params.gameid);

            if(gameid) {
                //retrieve games with the given gameid
                const foundGames = await games.find({
                    _id: gameid
                })
                .toArray();

                //There should be exactly 1 game per gameid
                if (foundGames.length === 0) {
                    res.status(400).send("gameid did not return any matching games");
                }

                else if(foundGames.length > 1) {
                    res.status(500).send("gameid returned more than one matching game. Database might be malformed.");
                }

                else {
                    res.status(200).json(foundGames[0]);
                }
            }
        }

        catch (e) {
            res.status(500).send(e.message);
        }
    });

    app.post("/games/", async function (req, res) {
        /* #swagger.parameters['add-info'] = {
            in: 'body',
            schema: {
                $name: 'Forza Horizon 5',
                $esrbRating: 'E',
                $genres: [
                    
                ],
                $metacritic: 82,
                $playTime: 500,
                $platforms: [
                    
                ],
                $releaseDate: '2021-05-05',
                $updateDate: '2022-08-03',
                $completed: false,
                $owned: true,
                $rating: 91,
                $userPlayTime: 100,
                $added: '2023-02-06'
            }
        }
        */

        //start by creating a new game 
        const games = await client.db("project2").collection("games");
        let game = req.body;
        try {
            game = await gameCreateSchema.validateAsync(game);

            try {
                games.insertOne(game);
                console.log("Successfully inserted game");
                res.status(201).json(game._id);
            }
            catch (e) {
                console.log("Post error 1");
                res.status(500).send("Error inserting game " + e.message);
            }
        }
        catch (e) {
            res.status(400).send(e.message);
        }
    });

    app.post("/usergames/", async function(req, res) {
        /* #swagger.parameters['add-info'] = {
            in: 'body',
            schema: {
                $access_token: 'adfasdfasdfa',
                $gameid: 'eqajeflkjadsa'
            }
        }
        */

        const userGames = await client.db("project2").collection("usergames");
        let reqBody = req.body;
        

        try {
            console.log("before validation post usergame");
            reqBody = await userGameCreateSchema.validateAsync(reqBody);
            console.log("validated post usergame");
            const gameid = reqBody.gameid;
            const token = reqBody.access_token;

            const tokeninfo = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
            //console.log(tokeninfo);

            const userGame =  {
                userid: tokeninfo.data.sub,
                gameid: gameid
            };

            try {
                userGames.insertOne(userGame);
                res.status(201).json(userGame._id);
            }
            catch (e) {
                res.status(500).send("Error inserting usergame " + e.message);
            }
        }
        catch (e) {
            res.status(400).send(e.message);
        }
    });

    app.put("/games/:gameid", async function(req, res) {
        /* #swagger.parameters['edit-info'] = {
            in: 'body',
            schema: {
                $name: 'Forza Horizon 5',
                $esrbRating: 'E',
                $genres: [
                    
                ],
                $metacritic: 82,
                $playTime: 500,
                $platforms: [
                    
                ],
                $releaseDate: '2021-05-05',
                $updateDate: '2022-08-03',
                $completed: false,
                $owned: true,
                $rating: 91,
                $userPlayTime: 100,
                $added: '2023-02-06'
            }
        }
        */

        const games = await client.db("project2").collection("games");
        let game = req.body;
        const gameid = req.params.gameid;

        try {
            game = await gameUpdateSchema.validateAsync(game);
            try {
                games.replaceOne({ _id: gameid }, game);
                res.status(204).json(game._id);
            }
            catch (e) {
                res.status(500).send("Error updating game " + e.message);
            }
        }
        catch(e) {
            res.status(400).send(e.message);
        }
    });

    app.delete("/games/:gameid", async function(req, res) {
        const games = await client.db("project2").collection("games");
        let gameid = req.params.gameid;

        //attempt to turn gameid into a objectid
        try {
            gameid = new ObjectId(gameid);

            //attempt to delete
            const response = await games.deleteMany({ _id: gameid });
            if(response.deletedCount === 1) {
                res.status(204).send();
            }
            else if(response.deletedCount === 0) {
                res.status(400).send("No games found with the given gameid");
            }

            else {
                res.status(500).send("More than one game with the given id was found. The database may be malformed.");
            }
        }
        catch(e) {
            res.status(400).send("gameid is malformed " + e.message);
        }

        
    });

    app.delete("/usergames/", async function(req, res) {
        /* #swagger.parameters['add-info'] = {
            in: 'body',
            schema: {
                $access_token: 'adfasdfasdfa',
                $gameid: 'eqajeflkjadsa'
            }
        }
        */

        let userGames = await client.db("project2").collection("usergames");
        let reqBody = req.body;

        try {
            reqBody = await userGameCreateSchema.validateAsync(reqBody);

            const token = reqBody.access_token;
            const tokenInfo = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
            const userid = tokenInfo.data.sub;
    
            const gameid = reqBody.gameid;

            const response = await userGames.deleteMany({ gameid: gameid, userid: userid });

            if(response.deletedCount === 1) {
                res.status(204).send();
            }
            else if(response.deletedCount === 0) {
                res.status(400).send("No usergames found with the given information");
            }

            else {
                res.status(500).send("More than one game with the given information was found. The database may be malformed.");
            }
        }
        catch (e) {
            res.status(400).send(e.message);
        }
    });

    app.listen(port, () => console.log("Started Server listening on port " + port));
}



