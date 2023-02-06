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
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-headers",
        "Origin, X-Requested-Width, Content-Type, Accept, Z-Key"
    );
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

//setup mongodb
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

//set up swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

//routes
routes();

async function routes() {
    const client = await databaseConnect();

    //get games by userid
    app.get("/games/:userid", async function (req, res) {
        try {
            const games = await client.db("project2").collection("games");

            const userid = req.params.userid;
            if(userid) {
                const foundDoc = await games.find({
                    userid: userid
                })
                .toArray();

                res.status(200).json(foundDoc);
            }

            else {
                res.status(400).send("userid parameter required.");
            }
        }
        catch(e) {
            res.status(500).send(e);
        }
    });

    app.post("/games/", async function (req, res) {
        /* #swagger.parameters['add-info'] = {
            in: 'body',
            schema: {
                $userid: 'fasfdsjlfasdoiu',
                $gameid: 60,
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

        const game = req.body;

        if(validateGame(game)) {
            try {
                games.insertOne(game);
                console.log("Successfully inserted game");
                res.status(201).json(game._id);
            }
            catch (e) {
                console.log("Post error 1");
                res.status(500).send("Error inserting game " + e);
            }
        }

        else {
            console.log("Post error 2");
            res.status(400).send("Game is not formatted correctly.");
        }
    });

    app.listen(port, () => console.log("Started Server listening on port " + port));
}

function validateGame(game) {
    //TODO: Validation
    return true;
}

async function databaseConnect() {
    const client = new MongoClient(process.env.CONNECTION, {
        useNewUrlParser: true,
        useUnifiedtopology: true
    });

    try {
        await client.connect();
        return client;
    }
    catch(e) {
        console.error(e);
        client.close();
    }
}