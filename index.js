const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xuxjswq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const serviceCollection = client.db('photographyServices').collection('services');
    const reviewCollection = client.db('photographyServices').collection('reviews');
    // services api
    app.get('/services', async (req, res) => {
        const query = {};
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services)
    });

    app.get('/services-on-homepage', async (req, res) => {
        const query = {};
        const cursor = serviceCollection.find(query);
        const services = await cursor.limit(3).toArray();
        res.send(services)
    });

    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await serviceCollection.findOne(query);
        res.send(service);
    })
    // review api

    app.get('/reviews', async (req, res) => {
        let query = {};
        if (req.query.email) {
            query = {
                userEmail: req.query.email
            }
        }
        const cursor = reviewCollection.find(query).sort({ insertionTime: -1 });
        const reviews = await cursor.toArray();
        res.send(reviews)
    })

    app.post('/reviews', async (req, res) => {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result);
    })

    app.get('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        const query = { service: id };
        const cursor = reviewCollection.find(query).sort({ insertionTime: -1 });
        const reviews = await cursor.toArray();
        res.send(reviews)
    })
}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
    res.send('photography server is running')
})

app.listen(port, () => {
    console.log(`photography server running on ${port}`);
})