const swagger = require("swagger-autogen")();
require("dotenv").config();

const doc = {
    info: {
        title: "Games API",
        description: "Game Library Backend"
    },
    /*host: "https://cse341-2-ky6l.onrender.com",
    schemes: ["https"]*/
    /*host: "localhost:8080",
    schemes: ["http"]*/
    host: process.env.HOST,
    schemes: process.env.SCHEMES
};

const output = "./swagger.json";
const server = ["./server.js"];
swagger(output, server, doc).then(() => {
    require("./server.js");
});