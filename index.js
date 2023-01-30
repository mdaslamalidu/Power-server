const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Power server is running");
});

const uri = `mongodb+srv://${process.env.USERID}:${process.env.PASS}@cluster0.xx7e6y8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const billingCollections = client
      .db("power-distribute")
      .collection("Billing-List");
    const billingUsersCollections = client
      .db("power-distribute")
      .collection("BillingUsers");

    app.get("/billing-list", async (req, res) => {
      let query = {};
      const page = req.query.page;
      const size = req.query.size;
      const result = await billingCollections
        .find(query)
        .skip(parseInt(page * size))
        .limit(parseInt(size))
        .toArray();
      const count = await billingCollections.estimatedDocumentCount();
      res.send({ result, count });
    });

    app.get("/totalBill-list", async (req, res) => {
      let query = {};
      const result = await billingCollections.find(query).toArray();
      res.send(result);
    });

    app.post("/add-billing", async (req, res) => {
      const query = req.body;
      const result = await billingCollections.insertOne(query);
      res.send(result);
    });

    app.post("/registration", async (req, res) => {
      const query = req.body;
      const result = await billingUsersCollections.insertOne(query);
      res.send(result);
      console.log(result);
    });

    app.get("/login/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await billingUsersCollections.findOne(query);
      console.log(user);
      res.send(user);
    });

    app.delete("/delete-billing/:id", async (req, res) => {
      const query = req.params.id;
      const filter = { _id: ObjectId(query) };
      const result = await billingCollections.deleteOne(filter);
      res.send(result);
    });

    app.get("/billing/:handleId", async (req, res) => {
      const query = req.params.handleId;
      const filter = { _id: ObjectId(query) };
      const result = await billingCollections.findOne(filter);
      res.send(result);
    });

    app.get("/bill/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await billingCollections.findOne(query);
      res.send(user);
    });

    app.put("/update-billing/:id", async (req, res) => {
      const query = req.params.id;
      const user = req.body;
      const filter = { _id: ObjectId(query) };
      const updateOne = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await billingCollections.updateOne(
        filter,
        updatedDoc,
        updateOne
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch((error) => console.log(error));

app.listen(port, () => console.log(`Power server is running on port ${port}`));
