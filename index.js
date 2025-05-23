import express, { json } from 'express';

import cors from 'cors';
require('dotenv').config();
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(json());


import reviews from './reviews.json';

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
    // await client.connect();
    const reviewCollection = client.db('reviewsDB').collection('reviews');
    const watchlistCollection = client.db('reviewsDB').collection('watchlists');
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

    app.get('/highest-rated-reviews', async (req, res) => {
        try {
            const result = await reviewCollection
            .find({ rating: { $gte: 8.5 } }) 
            .sort({ rating: -1 })            
            .limit(6)
            .toArray();

            res.send(result);
        } catch (error) {
            res.send({ message: 'Error fetching highest rated reviews', error });
        }
    });


    app.put('/reviews/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)}
        const options = {upsert : true};
        const updatedReview = req.body;
        const updateReviews= {
            $set: {
                title: updatedReview.title,
                coverImage: updatedReview.coverImage,
                rating: updatedReview.rating,
                year: updatedReview.year,
                genre: updatedReview.genre,
                userEmail: updatedReview.userEmail,
                userName: updatedReview.userName,
                description: updatedReview.description,
                trending: updatedReview.trending,
                date: updatedReview.date
            } 
        }
        const result = await reviewCollection.updateOne(filter, updateReviews, options);
        res.send(result);
    })

    app.delete('/reviews/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await reviewCollection.deleteOne(query);
        res.send(result);
    })

    app.post('/api/watchlist', async(req, res) =>{
        const newWatchlist = req.body;
        const result = await watchlistCollection.insertOne(newWatchlist);
        res.send(result);
    })

    app.get('/api/watchlist', async(req, res)=>{
        const allItems = await watchlistCollection.find().toArray();
        res.send(allItems);
    })

    app.get('/api/watchlist/:id', async (req, res) => {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid ID format' });
        }

        const query = { _id: new ObjectId(id) };
        const result = await watchlistCollection.findOne(query);

        if (!result) {
            return res.status(404).send({ error: 'Watchlist item not found' });
        }

        res.json(result);
    });

    app.delete('/api/watchlist/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await watchlistCollection.deleteOne(query);
        res.send(result);
    })


    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=>{
    console.log(`GameNest Server is running on port : ${port}`)
})

