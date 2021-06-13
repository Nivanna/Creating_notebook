const express = require('express');
const db =  require('./config/db');
const app = express();

app.use(express.json());

// test connect to db
(async function(){
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
})();
app.get('/', (req, res)=>{
    return res.status(201).send('welcome to note home page')
});

// Router 
const userRouter = require('./route/userRouter');
app.use('/users', userRouter);

const noteRouter = require('./route/noteRouter');
app.use('/notes', noteRouter);

const port = process.env.PORT | 5000;

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
});