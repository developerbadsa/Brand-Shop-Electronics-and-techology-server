const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5003;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://rahimbadsa723:Ofqat5fdGeCj9PDc@cluster0.r2ad8dg.mongodb.net/?retryWrites=true&w=majority";

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());




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
        // await client.connect();
        const brandCollection = client.db('brandNameDB').collection('brandNameDBCollection');
        const productCollection = client.db('productDB').collection('productDBCollection');
        const cartCollection = client.db('cartDB').collection('cartDBCollection');
        const Subscriber = client.db('SubscriberDB').collection('SubscriberCollection');



        app.get('/brand', async (req, res) => {
            try {
                const cursor = brandCollection.find();
                const brands = await cursor.toArray();

                res.json(brands); 
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        })



        app.get('/product/:brand', async (req, res) => {
            try {
                let brandName = req.params.brand.trim();

                const cursor = productCollection.find({ brand: { $regex: new RegExp(brandName, 'i') } });

                const products = await cursor.toArray();

                res.json(products);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        //add product to brand product collection
        app.post('/addproduct', async (req, res) => {
            try {
                const ProductData = req.body;
                const result = await productCollection.insertOne(ProductData);
                res.send(result)
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.post('/subscribe', async (req, res) => {
            try {
                const email = req.body;
                const result = await Subscriber.insertOne(email);
                res.send(result)
            } catch (error){
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
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
        app.post('/cart', async (req, res) => {
            try {
                const cartDetails = req.body;
                const result = await cartCollection.insertOne(cartDetails);
                res.send(result)
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });


        app.get('/cart', async (req, res) => {
            try {
                const cursor = cartCollection.find();
                const cart = await cursor.toArray();

                res.json(cart); // Send the retrieved data as a JSON response
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        })


        //delete card data
        app.delete("/cart/:_id", async (req, res) => {
            const id = req.params._id;

            const query = { _id: id }
            const result = await cartCollection.deleteOne(query);
            res.send(result)


        });


        app.get("/updateProduct/:id", async (req, res) => {

            const id = req.params.id;

            const query = { _id: id }
            const result = await productCollection.findOne(query);
            res.send(result)


        })


        app.put("/updateProduct1/:id", async (req, res) => {
            const id = req.params.id; 
            console.log("Received update request for product with ID:", id);
        
            try {
                const query = { _id: id};
                const updatedData = req.body;
                console.log("Received update data:", updatedData);
        
                const result = await productCollection.updateOne(query, { $set: updatedData });
                console.log("Update result:", result);
        
                if (result.modifiedCount === 1) {
                    res.json({ message: "Product updated successfully" });
                } else {
                    res.status(404).json({ message: "Product not found" });
                }
            } catch (error) {
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


app.get('/', (req, res)=>{
    res.send('running server')
})

app.listen(port, () => {
    console.log(`Simple Crud is Running on port ${port}`);
});