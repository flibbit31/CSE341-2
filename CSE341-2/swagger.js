const swagger = require("swagger-autogen")();

const doc = {
    info: {
        title: "Games API",
        description: "Game Library Backend"
    },
    host: "localhost",
    schemes: ["http"]
};

const output = "./swagger.json";
const server = ["./server.js"];
swagger(output, server, doc).then(() => {
    require("./server.js");
});