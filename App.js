const express = require('express');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccount.json');
const bodyParser = require('body-parser');


initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
// Create a new Express app
const app = express();
app.use(bodyParser.json());

// Define a route to fetch data from Firestore
app.get('/data', async (req, res) => {
    try {
        const data = [];
        const snapshot = await db.collection('users').get();
        snapshot.forEach(doc => {
            data.push(doc.data());
        });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.post('/data', async (req, res) => {
    try {
        console.log(req.body)
        // const data = req.body;
        // const docRef = await db.collection('users').add(data);
        // res.status(201).json({ id: docRef.id });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
