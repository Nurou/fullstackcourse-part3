const express = require('express');
// function used to create an express app
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    date: '2019-05-30T17:30:31.098Z',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only Javascript',
    date: '2019-05-30T18:39:34.091Z',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    date: '2019-05-30T19:20:14.298Z',
    important: true
  }
];

// defining routes to app

// event handler used to handle
// HTTP GET reqs made to app's root
app.get('/', (req, res) => {
  console.log(req.headers);
  res.send('<h1>Hello Wold!</h1>');
});

// handles GET reqs to nodes path
app.get('/notes', (req, res) => {
  res.json(notes);
});

app.get('/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find(note => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.status(400).end();
  }
});

// delete note
app.delete('/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter(note => note.id !== id);
  response.status(204).end();
});

const generateID = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0;
  // unique note ID
  return maxId + 1;
};

// add note
app.post('/notes', (request, response) => {
  // get body from req
  const body = request.body;

  if (!body.content) {
    // return crucial
    return response.status(400).json({
      error: 'content missing'
    });
  }
  const note = {
    // note content - can't be empty
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateID()
  };
  // add the new note
  notes = notes.concat(note);
  // return it
  response.json(note);
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
