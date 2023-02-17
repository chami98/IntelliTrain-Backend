const express = require('express');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
const bodyParser = require('body-parser');
const cors = require("cors");

// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
// const admin = require('firebase-admin');
admin.initializeApp();

const db = getFirestore();
// Create a new Express app
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));

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
        const data = req.body;
        const docRef = await db.collection('users').add(data);
        res.status(201).json({
            "UserID": `${docRef.id}`,
            "Message": "User Added Successlly"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.put('/data/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const docRef = db.collection('users').doc(id);
        await docRef.set(data, { merge: true });
        res.status(200).send('Document updated successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.post('/signup', async (req, res) => {
    try {
        // Get user details from the request body
        const { token } = req.body;
        const user = await admin.auth().verifyIdToken(token);
        console.log(user);

        // Check if the user already exists in Firestore
        const userRef = db.collection('users').doc(user.uid);
        const snapshot = await userRef.get();
        if (snapshot.exists) {
            res.status(409).send('User already exists');
        } else {
            // Add user details to Firestore
            await userRef.set({
                uid: user.uid,
                email_verified: user.email_verified,
                email: user.email,
            });
            res.status(201).json({
                "UserID": `${user.uid}`,
                "Message": "User Added Successlly"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = app;
