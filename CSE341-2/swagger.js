const swagger = require("swagger-autogen")();

const doc = {
    info: {
        title: "Games API",
        description: "Game Library Backend"
    },
    host: "https://cse341-2-ky6l.onrender.com",
    schemes: ["https"]
    /*host: "localhost:8080",
    schemes: ["http"]*/
};

const output = "./swagger.json";
const server = ["./server.js"];
swagger(output, server, doc).then(() => {
    require("./server.js");
});