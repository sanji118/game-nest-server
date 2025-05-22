const express = require('express')
const cors = require('cors');
require('dotenv').config();
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb')

const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());


const reviews = require('./reviews.json')

app.get('/', (req, res)=>{
    res.send('GameNest server is running !');
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.95qfhdq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const reviewCollection = client.db('reviewsDB').collection('reviews');
    await reviewCollection.deleteMany({});
    await reviewCollection.insertMany(reviews);

    
    
    app.get('/reviews', async(req, res)=>{
        const allReviews = await reviewCollection.find().toArray();
        res.send(allReviews);
    })

    app.post('/reviews', async(req, res) =>{
        const newReview = req.body;
        const result = await reviewCollection.insertOne(newReview);
        res.send(result);
    })
    
    app.get('/reviews/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await reviewCollection.findOne(query);
        res.json(result);
    })
    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=>{
    console.log(`GameNest Server is running on port : ${port}`)
})

