const fs = require('fs');
const amqp = require('amqplib');
const csv = require('csv-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const Content = require("./Content");
const bodyParser = require('body-parser');
const isAuthenticated = require('../isAuthenticated');

const app = express();
app.use(bodyParser.json());

var channel, connection;

mongoose.connect(
    "mongodb://localhost/content-service",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Content-Service DB Connected`);
    }
);

async function connect(){
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("CONTENT_INTERACTION");
    await channel.assertQueue("DELETE_USER_DATA");
    await channel.assertQueue("DELETE_STORY");
}
connect().then(() => {
    channel.consume("CONTENT_INTERACTION",  async (data) => {
        const Id = JSON.parse(data.content);
        await Content.updateOne({contentID: Id.id}, {$inc: {interaction: 1}});
        channel.ack(data);
    })
    channel.consume("DELETE_USER_DATA",  async (data) => {
        const user = JSON.parse(data.content);
        const stories = await Content.find({userID: user.email});
        for(let ele of stories){
            const id = ele.contentID;
            await Content.deleteOne({contentID: id});
            channel.sendToQueue(
                "DELETE_CONTENT",
                Buffer.from(
                    JSON.stringify({
                        id,
                    })
                )
            )
        }
        channel.ack(data);
    })
    channel.consume("DELETE_STORY",  async (data) => {
        const Id = JSON.parse(data.content);
        await Content.deleteOne({contentID: Id.id});
        const id = Id.id;
        channel.sendToQueue(
            "DELETE_CONTENT",
            Buffer.from(
                JSON.stringify({
                    id,
                })
            )
        )
        channel.ack(data);
    })
});

app.post("/content/testing", async (req, res) => {
    const results = [];
    fs.createReadStream('dummyData.csv')
        .pipe(csv({}))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            await Content.insertMany(results);
            for(let ele of results){
                channel.sendToQueue(
                    "CREATE_CONTENT",
                    Buffer.from(
                        JSON.stringify({
                            ele,
                        })
                    )
                )
            }
            res.send(results);
        })
});

app.get("/content/new-content", async (req, res) => {
    const contents = await Content.find().sort({created_at: -1});
    return res.send(contents);
});

app.get("/content/top-content", async (req, res) => {
    // Code for Top-Content;
    const topContent = await Content.find({}, 'title story contentID').sort( { interaction: -1 } )
    res.send(topContent);
});

app.post("/content/create", isAuthenticated, async (req, res) => {
    const { title, story} = req.body;
    let authorization = req.headers.authorization.split(' ')[1],
            decoded;
    try {
        decoded = jwt.verify(authorization, "secret");
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const user = decoded.email;
    const count = await Content.find({userID: user});
    const content_id = user.split('@')[0] + '_' + (count.length+1).toString();
    const newContent = new Content({
        title,
        story,
        contentID: content_id,
        userID: user, 
    });
    channel.sendToQueue(
        "CREATE_CONTENT",
        Buffer.from(
            JSON.stringify({
                newContent,
            })
        )
    )
    newContent.save();
    res.send(newContent);
});

app.post("/content/delete", isAuthenticated, async (req, res) => {
    const { contentID } = req.body;
    let authorization = req.headers.authorization.split(' ')[1],
            decoded;
    try {
        decoded = jwt.verify(authorization, "secret");
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const email = decoded.email;
    const content = await Content.find({contentID: contentID});
    // if(email != content.userID){
    //     return res.send("You can only delete stories that are created by you!");
    // }
    const id = contentID;
    channel.sendToQueue(
        "DELETE_STORY",
        Buffer.from(
            JSON.stringify({
                id,
            })
        )
    )
    res.send("Deleted Story!");
});


app.listen(5001, () => {
    console.log(`Content-Service at $5001`);
});


// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const csvWriter = createCsvWriter({
//     path: 'dummyData.csv',
//     header: [
//         {id: 'title', title: 'title'},
//         {id: 'story', title: 'story'},
//         {id: 'userID', title: 'userID'},
//         {id: 'contentID', title: 'contentID'},
//         {id: 'date', title: 'created_at'},
//     ]
// });
 
// const records = [
//         {title: 'Title1', story: 'story1', userID: 'user1@gmail.com', contentID: 'user1_1', date: '2022-01-01T18:30:00.000+00:00'},
//         {title: 'Title2', story: 'story2', userID: 'user1@gmail.com', contentID: 'user1_2', date: '2022-01-15T18:30:00.000+00:00'},
//         {title: 'Title3', story: 'story3', userID: 'user2@gmail.com', contentID: 'user2_1', date: '2022-01-12T18:30:00.000+00:00'},
//         {title: 'Title4', story: 'story4', userID: 'user3@gmail.com', contentID: 'user3_1', date: '2022-01-16T18:30:00.000+00:00'},
//         {title: 'Title5', story: 'story5', userID: 'user4@gmail.com', contentID: 'user4_1', date: '2022-01-08T18:30:00.000+00:00'},
//         {title: 'Title6', story: 'story6', userID: 'user5@gmail.com', contentID: 'user5_2', date: '2022-01-15T18:30:00.000+00:00'},
//         {title: 'Title7', story: 'story7', userID: 'user6@gmail.com', contentID: 'user6_1', date: '2022-01-06T18:30:00.000+00:00'},
//         {title: 'Title8', story: 'story8', userID: 'user7@gmail.com', contentID: 'user7_1', date: '2022-01-05T18:30:00.000+00:00'},
// ];
 
// csvWriter.writeRecords(records)       // returns a promise
//     .then(() => {
//         console.log('...Done');
//     });



// docker run -p 5672:5672 rabbitmq