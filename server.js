const { error } = require('console');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const port = process.env.port || 3001;

const app = express();


app.use(express.json());

app.use(express.static('public'));

app.get(`/notes`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});


app.get('/api/notes', (req, res) => {
    console.log(`${req.method} request received to get notes`);

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('Error reading notes');
        }
        const notesArray = JSON.parse(data);
        const newNote = {
            id: uuid(),
            ...req.body
        };
        notesArray.push(newNote);
        
        fs.writeFile('./db/db.json', JSON.stringify(notesArray, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json('Error saving notes');
            }
            res.json(newNote);
        });
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const deleteId = req.params.id;

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('Error reading notes');
        }

        let notesList = JSON.parse(data);

        notesList = notesList.filter(note => note.id !== deleteId);

        fs.writeFile('./db/db.json', JSON.stringify(notesList, null, 2), (err) => {
            if (err) {
            console.error(err);
            res.status(500).json(`Couldn't write file`);
            }
            res.send('success!');
        });     
    });
});



app.get(`*`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});


app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});