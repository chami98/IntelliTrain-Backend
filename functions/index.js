const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });

admin.initializeApp();


const app = express();
const db = getFirestore();

app.get('/test', (req, res) => {
    res.send('Hello chhamikara')
});

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

exports.intelliTrain = functions.https.onRequest(app);
