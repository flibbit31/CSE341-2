//setup mongodb
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

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

module.exports = {
    databaseConnect
};