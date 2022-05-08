const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
// methdoe 
app.use(cors())
app.use(express.json())
function verifyjwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorize Access" })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" })
    }
    console.log('decoded', decoded);
    req.decoded = decoded
    next()
  })



}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vjk81.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
  try {
    await client.connect();
    const computerDetails = client.db("computerhub").collection("storage");
    const addDetails = client.db("addeditem").collection("items");
    //login
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign({ user }, process.env.ACCESS_SECRET_KEY, {
        expiresIn: '1d'
      });
      console.log(accessToken);

      res.send({ accessToken })
    })


    app.get('/computer', async (req, res) => {
      const email = req.query;
      console.log(email);

      const query = {}
      const cursor = computerDetails.find(query);
      const cursurArray = await cursor.toArray()
      res.send(cursurArray)
      // console.log(cursor);
    })


    app.get('/computer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await computerDetails.findOne(query)
      res.send(result)
    })
    app.get('/added/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await addDetails.findOne(query)
      res.send(result)
    })




    app.patch('/computer/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const updateUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {

        $set: {
          quantity: updateUser.quantity
        },

      };
      console.log(updateDoc);

      const result = await computerDetails.updateOne(filter, updateDoc, options);
      res.send(result)

    })


    app.delete('/computer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await computerDetails.deleteOne(query)
      res.send({ result })
      console.log(result);


    })
    app.delete('/added/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await addDetails.deleteOne(query)
      res.send(result)
      console.log(result);


    })
    app.get('/added', verifyjwt, async (req, res) => {
      // const authHeader = req.headers.authorization;
      // console.log(authHeader);
      const decodedEmail = req.decoded.user.email;
      const email = req.query.email;
      console.log(email);
      if (email === decodedEmail) {
        const query = { email: email }


        const cursor = addDetails.find(query);
        const cursurArray = await cursor.toArray()
        res.send({ cursurArray })
      }
      else {
        res.status(403).send({ message: "forbidden Access" })
      }

      // console.log(cursor);
    })

    app.post('/added', async (req, res) => {
      const newitem = req.body;
      console.log(newitem);
      const result = await addDetails.insertOne(newitem)


      res.send({ result })



    })
    app.post('/computer', async (req, res) => {
      const newuser = req.body;
      const result = await computerDetails.insertOne(newuser)
      res.send({ result })

    })


  }
  finally {

  }
}
run().catch(console.dir)







app.get('/', (req, res) => {
  res.send("success the connection")
  console.log(`connection seccess ${port}`);

})

app.listen(port, () => {
  console.log(port);

})
