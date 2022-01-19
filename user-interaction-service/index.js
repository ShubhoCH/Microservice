const amqp = require('amqplib');
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const Interaction = require("./Interaction");
const isAuthenticated = require("../isAuthenticated");

const app = express();
app.use(bodyParser.json());

app.use(express.json());
mongoose.connect(
    "mongodb://localhost/interaction-service",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Interaction-Service DB Connected`);
    }
);

async function connect(){
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("CREATE_CONTENT");
    await channel.assertQueue("DELETE_CONTENT");
}
connect().then(() => {
    channel.consume("CREATE_CONTENT", async data => {
        const content = JSON.parse(data.content);
        const contentInteraction = new Interaction({
            contentID: content.newContent.contentID,
            title: content.newContent.title,
            story: content.newContent.story,
            read: 0,
            like: 0,
            total: 0,
        });
        await contentInteraction.save();
        channel.ack(data);
    });
    channel.consume("DELETE_CONTENT", async data => {
        const Id = JSON.parse(data.content);
        await Interaction.deleteOne({contentID: Id.id});
        channel.ack(data);
    });
});

app.post("/interact/read", isAuthenticated, async (req, res) => {
    const id = req.body.contentID;
    await Interaction.updateOne({contentID: id}, {$inc: {read: 1}});
    await Interaction.updateOne({contentID: id}, {$inc: {total: 1}});

    channel.sendToQueue(
        "CONTENT_INTERACTION",
        Buffer.from(
            JSON.stringify({
                id,
            })
        )
    );
    const readContent = await Interaction.find({contentID: id}, 'title story contentID read like');
    res.send(readContent);
});

app.post("/interact/like", isAuthenticated, async (req, res) => {
    const id = req.body.contentID;
    await Interaction.updateOne({contentID: id}, {$inc: {like: 1}});
    await Interaction.updateOne({contentID: id}, {$inc: {total: 1}});

    channel.sendToQueue(
        "CONTENT_INTERACTION",
        Buffer.from(
            JSON.stringify({
                id,
            })
        )
    );
    const readContent = await Interaction.find({contentID: id}, 'title story contentID read like');
    res.send(readContent);
});

app.post("/interact/get_all_interaction", async (req, res) => {
    const data = await Interaction.find();
    res.send(data);
});

app.listen(5002, () => {
    console.log(`Content-Service at $5002`);
});