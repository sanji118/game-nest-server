const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv')
const {MongoClient, ServerApiVersion} = require('mongodb')

const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res)=>{
    res.send('GameNest server is running !');
})


app.listen(port, ()=>{
    console.log(`GameNest Server is running on port : ${port}`)
})