# Microservices:
![Untitled Diagram](https://user-images.githubusercontent.com/53439436/150290432-b190e655-68d1-4406-81cb-20609dd487b6.jpg)

## Prerequisite
- Docker
- MongoDB

## Installation

Clone the project from github then go to project directory inside the project and type the following command to install all the required dependencies for the project!

```bash
npm install
```
After that open three more CMD Windows and type the following command into each one respectively:
#### NOTE - Make sure you run RabbitMQ first before running any service:
1st CMD Window
```bash
docker run -p 5672:5672 rabbitmq
```
2nd CMD Window
```bash
cd content-service
npm i
npm start
```
3rd CMD Window
```bash
cd user-interaction-service
npm i
npm start
```
4th CMD Window
```bash
cd user-service
npm i
npm start
```
as shown in the following figure: \

![Screenshot (524)](https://user-images.githubusercontent.com/53439436/150294644-bab0bc56-9039-4273-b423-41be8814d29b.png)



This will start all the of our microservices at port 5000, 5001 & 5002 respectively.

## Services:

### Content Service
Serving books as content.
- New contents API
- Top contents API
- Testing- An API for uploading the csv file.

### User interaction service
- User Read event(validate if user exists) 
- User Like event(validate if user exists)

### User service
- REST API's for CRUD operations on user.[First name, last name, email_id, phone number]

## API's routes:

#### NOTE: Please find the Post-Man collection inside the PostMan_Collection folder of the project!
### Content-Service:
#### Testing API (For Data Ingestion via CSV)
- http://localhost:5001/content/testing
```bash
POST Request:
```

#### New Content (Contents sorted in the order of creation)
- http://localhost:5001/content/new-content
```bash
GET Request:
```

#### Top Content (Contents sorted in the decreasing order of Interactions)
- http://localhost:5001/content/top-content
```bash
GET Request:
```

#### Add New Story (If Authenticated)
- http://localhost:5001/content/create
```bash
POST Request:

Headers:
Authorization -> Bearer <TOKEN>

Body -> raw -> json:
{
    "title": "TESTING_09",
    "story": "STORY_09"
}
```

#### Delete Content (If Owner)
- http://localhost:5001/content/delete
```bash
POST Request:

Headers:
Authorization -> Bearer <TOKEN>

Body -> raw -> json:
{
    "contentID": "<contentID>"
}
```

### User-Interaction-Service:
#### Like (If Authenticated):
- http://localhost:5002/interact/like
```bash
POST Request:

Headers:
Authorization -> Bearer <TOKEN>

Body -> raw -> json:
{
    "contentID": "<contentID>"
}
```

#### Read (If Authenticated):
- http://localhost:5002/interact/read
```bash
POST Request:

Headers:
Authorization -> Bearer <TOKEN>

Body -> raw -> json:
{
    "contentID": "<contentID>"
}
```

#### List All Interactions:
- http://localhost:5002/interact/get_all_interaction
```bash
GET Request:
```

### User-Service:
#### User Register:
- http://localhost:5000/user/register
```bash
POST Request:

Body -> raw -> json:
{
    "firstName": "Test",
    "lastName": "One",
    "email": "Test2@gmail.com",
    "phone": "9999999999",
    "password": "123"
}
```
#### User Login:
- http://localhost:5000/user/login
```bash
POST Request:

Body -> raw -> json:
{
    "email": "<email>",
    "password": "<password>"
}
```
#### Delete User (If Authenticated & Owner):
- http://localhost:5000/user/delete
```bash
POST Request:

Headers:
Authorization -> Bearer <TOKEN>

Body -> raw -> json:
{
    "email": "<email>",
    "password": "<password>"
}
```
#### List All Users:
- http://localhost:5000/user/list_all
```bash
GET Request:
```