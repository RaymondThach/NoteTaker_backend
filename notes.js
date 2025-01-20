import express from 'express';
import { passwordConfig as SQLAuthentication } from './config.js';
import { createDatabaseConnection } from './database.js';

//Iniate the express router to connect to client
const router = express.Router();
router.use(express.json());

//Connect to SQL server and create the users and notes tables if not existing
const database = await createDatabaseConnection(SQLAuthentication);

//On client startup provides client all of the user's notes
router.get('/all/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        //console.log(userId);
        const notes = await database.allNotes(userId);
        console.log(notes);
        console.log(`notes: ${JSON.stringify(notes)}`);
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ error: err?.message });
    }
});

//On client startup get logged in user's id
router.get('/userId/:userName', async (req, res) => {
    try {
        const name = req.params.userName;
        const id = await database.getUserId(name);
        console.log(`id: ${JSON.stringify(id)}`);
        res.status(200).json(id);
    } catch (err) {
        res.status(500).json({ error: err?.message });
    }
});

/* On client startup create user if doesn't exist
Accepts JSON Body { "userName" : "exampleName"}*/
router.post('/createUser', async (req, res) => {
    try {
        const user = req.body;
        const rowsAffected = await database.createUser(user);
        res.status(201).json({ rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err?.message });
    }
});

/* Create a note from creation form for authenticated in user
Accepts JSON Body { "userId" : "1","noteName": "exampleName","note": "exampleNote"}*/
router.post('/createNote', async (req, res) => {
    try {
        const note = req.body;
        const rowsAffected = await database.createNote(note);
        res.status(201).json({ rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err?.message });
    }
});

//Delete an authenticated user's note from the client's modal 
router.delete('/deleteNote/:noteId', async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const rowsAffected = await database.deleteNote(noteId);
        res.status(204).json({ rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err?.message });
    }
});

//Update an authenticated user's note from the client's modal
router.put('/updateNote', async (req,res) => {
    try {
        const note = req.body;
        const rowsAffected = await database.updateNote(note);
        res.status(200).json({ rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err?.message });
    }
});

export default router;