const User = require("./User");
const amqp = require('amqplib');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const isAuthenticated = require("../isAuthenticated");

const app = express();
app.use(bodyParser.json());

mongoose.connect(
  "mongodb://localhost/user-service",
  {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  },
  () => {
      console.log(`User-Service DB-Connected`);
  }
);

async function connect(){
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
}
connect()

app.post('/user/register', async (req, res) => {
    // const { email, password, name } = req.body;
    const { firstName, lastName, email, phone, password} = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.json({ message: "User already exists" });
    } else {
        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
        });
        newUser.save();
        return res.json(newUser);
    }
})

app.post('/user/login', async (req, res) => {
    //Authenticate:
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User doesn't exist" });
    } else {
        if (password !== user.password) {
            return res.json({ message: "Password Incorrect" });
        }
        const payload = {
            email,
            name: user.firstName
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else return res.json({ token: token });
        });
    }
})

app.get('/user/list_all', async (req, res) => {
    //Send list of all Users!
    const Users = await User.find();
    const List = [];
    Users.forEach((x) => {
        List.push({
            Name: x.firstName + " " + x.lastName,
            Email: x.email,
        });
    })
    return res.send(List);
})

app.post('/user/delete', isAuthenticated, async (req, res) => {
    const data = req.body;
    let authorization = req.headers.authorization.split(' ')[1],
            decoded;
    try {
        decoded = jwt.verify(authorization, "secret");
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    if(decoded.email != data.email){
        return res.send("You cannot delete other User's Profile!")
    }else if(decoded.password != req.password){
        return res.send("Incorrect Password!");
    }
    const email = data.email;
    channel.sendToQueue(
        "DELETE_USER_DATA",
        Buffer.from(
            JSON.stringify({
                email,
            })
        )
    )
    await User.deleteOne({email: data.email});
    res.send("Profile deleted Successfully!");
})

app.listen(5000, () => {
    console.log(`User-Service at $5000`);
});
