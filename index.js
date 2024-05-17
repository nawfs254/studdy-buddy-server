const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zmqyle4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentCollection = client.db('assignmentDB').collection('assignments')

    app.get('/assignments', async(req, res) => {
        const cursor = assignmentCollection.find();
        const result = await cursor.toArray()

        res.send(result)    
    })

    app.get('/assignments/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const result = await assignmentCollection.findOne(query)

      res.send(result)
    })

    app.post('/assignments', async(req, res) => {
        const newAssignment = req.body;
        console.log(newAssignment)

        const result = await assignmentCollection.insertOne(newAssignment)
        res.send(result)
        
    })

    app.put("/assignments/:id", async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert : true}

      console.log(id, filter, options)

      const updatedAssignments = req.body
      const newAssignment = {
        $set: {
          author: updatedAssignments.author, 
          title: updatedAssignments.title, 
          marks: updatedAssignments.marks,
          imgUrl: updatedAssignments.imgUrl, 
          submissionDate: updatedAssignments.submissionDate, 
          difficulty: updatedAssignments.difficulty, 
          description: updatedAssignments.description
        }
      }

      console.log(`new Assignment is` , newAssignment)

      const result = await assignmentCollection.updateOne(filter, newAssignment)
      res.send(result)
    })

    app.delete('/assignments/:id', async(req, res)=> {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}

      const result = await assignmentCollection.deleteOne(query)
      res.send(result)
    })

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This is the server");
});

app.listen(port, () => {
  console.log(`app is listening in the port ${port}`);
});
