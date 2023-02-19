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

app.get('/data/:email', async (req, res) => {
    try {
        const email = req.params.email;
        console.log(email)

        // get the document from Firestore
        const snapshot = await db.collection('users').where('email', '==', email).get();
        if (snapshot.empty) {
            // return an error if no matching documents are found
            return res.status(404).send('User not found');
        }

        // extract the data from the document snapshot
        const data = snapshot.docs[0].data();

        // return the data as JSON
        res.json(data);
    } catch (err) {
        // return an error if there was a problem fetching the data
        res.status(500).send(err.message);
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
        console.log(req.body);
        const { token } = req.body;
        const { firstName } = req.body;
        const { lastName } = req.body;
        const { phoneNumber } = req.body;

        console.log(firstName, lastName, phoneNumber);

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
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                email_verified: user.email_verified,
                email: user.email,
                avaliableBalance: 0
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

app.put('/wallet', async (req, res) => {
    try {
        const { email, topUp } = req.body;

        // Find the user's document in the "users" collection based on their email address
        const usersRef = admin.firestore().collection('users');
        const query = usersRef.where('email', '==', email).limit(1);
        const userDoc = (await query.get()).docs[0];

        if (!userDoc) {
            res.status(404).send(`No user found with email address ${email}`);
            return;
        }

        const avaliableBalance = userDoc.data().avaliableBalance;

        // Update the specified field in the user's document
        await userDoc.ref.update({
            avaliableBalance: Number(avaliableBalance + topUp)
        });

        res.status(200).send(`Successfully updated for user with email ${email}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while updating the avaliableBalance field');
    }
});

exports.intelliTrain = functions.https.onRequest(app);
