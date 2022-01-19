# Microservices:
![Flow Chart]()

## Prerequisite
- Docker
- MongoDB

## Installation

Clone the project from github then go to project directory inside the project and type the following command to install all the required dependencies for the project!

```bash
npm install
```
After that open three more CMD Windiows and type the following command into each one respectively:
#### NOTE - Make sure you run RabbitMQ first before running any service:
1st Window
```bash
docker run -p 5672:5672 rabbitmq
```
2nd Window
```bash
cd content-service
npm start
```
3rd Window
```bash
cd user-interaction-service
npm start
```
4th Window
```bash
cd user-service
npm start
```
as shown in the following figure: \
![Screenshot (522)](https://user-images.githubusercontent.com/53439436/150204383-de98f98e-1ee3-4646-8882-9ad628963c53.png)


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

## API's

#### NOTE: Please find the Post-Man collection inside the PostMan_Collection folder of the project!

### API routes:
#### Content-Service:
- Testing API (For Data Ingestion via CSV):
    * http://localhost:5001/content/testing
- New Content (Contents sorted in the order of creation):
    * http://localhost:5001/content/new-content
- Top Content (Contents sorted in the decreasing order of Interactions):
    * http://localhost:5001/content/top-content
- Add New Story (If Authenticated):
    * http://localhost:5001/content/create
- Delete Content (If Owner):
    * http://localhost:5001/content/delete

#### User-Interaction-Service:
- Like (If Authenticated):
    * http://localhost:5002/interact/like
- Read (If Authenticated):
    * http://localhost:5002/interact/read
- List All Interactions:
    * http://localhost:5002/interact/get_all_interaction

#### User-Service:
- User Register:
    * http://localhost:5000/user/register
- User Login:
    * http://localhost:5000/user/login
- Delete User (If Authenticated & Owner):
    * http://localhost:5000/user/delete
- List All Users:
    * http://localhost:5000/user/list_all