const express = require("express");
const cors = require("cors");
const app = express();
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5003;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://rahimbadsa723:Ofqat5fdGeCj9PDc@cluster0.r2ad8dg.mongodb.net/?retryWrites=true&w=majority";

// middleware
app.use(cors());
app.use(express.json());

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const brandCollection = client.db('brandNameDB').collection('brandNameDBCollection');
        const productCollection = client.db('productDB').collection('productDBCollection');



        app.get('/brand', async (req, res) => {
            try {
                const cursor = brandCollection.find();
                const brands = await cursor.toArray();

                res.json(brands); // Send the retrieved data as a JSON response
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        })


        app.post('/product', async (req, res) => {
            try {
                const productDetails = req.body;
                const result = await productCollection.insertOne(productDetails);
                console.log(productDetails);
                res.json({ message: "Product added successfully" });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });



        app.get('/product/:brand', async (req, res) => {
            try {
                let brandName = req.params.brand.trim();

                //making case-insensitive regular expression to find products
                const cursor = productCollection.find({ brand: { $regex: new RegExp(brandName, 'i') } });

                const products = await cursor.toArray();
                console.log("Products:", products);

                res.json(products); 
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.get('/productCardDetails/:id', async (req, res) => {
            try {
                let id = req.params.id

                const query = { _id: new ObjectId(id) }
                const result = await productCollection.findOne(query);
                res.json(result); 
                console.log(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });




        


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Simple Crud is Running on port ${port}`);
});