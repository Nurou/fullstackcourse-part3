const express = require('express');
// function used to create an express app
const app = express();

/**
|--------------------------------------------------
| Middleware
|--------------------------------------------------
*/

// without a body-parser, the body property would be undefined
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// logging request data using morgan
const morgan = require('morgan');

morgan.token('data', function(req) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time :data')
);

// cors
const cors = require('cors');

app.use(cors());

// serve static files
app.use(express.static('build'));

// hard-coded list of phonebook entries
// would normally exist on server
let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  },
  {
    id: 5,
    name: 'test',
    number: '123'
  }
];

app.get('/', (req, res) => {
  res.send('<h1>Part3</h1>');
});

// display all persons
app.get('/api/persons', (req, res) => {
  res.send(persons);
});

// display one person
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    // display person entry in JSON
    res.json(person);
  } else {
    res.status(400).end();
  }
});

// display info
app.get('/info', (req, res) => {
  let message = `Phonebook has info for ${persons.length} people 
  --
  ${new Date()}`;
  res.send(message);
});

// delete a person
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
});

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map(person => person.id)) : 0;
  return maxId + 1;
};

const generateRandomId = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};
// add persons
app.post('/api/persons/', (req, res) => {
  // person content in request body
  const body = req.body;

  // is info missing?
  if (!body.name && body.number) {
    // return crucial
    return res.status(400).json({
      error: 'name or number missing'
    });
  }

  // does person with same name already exist?
  const isAlreadyAdded = persons.find(person => person.name === body.name);
  if (isAlreadyAdded) {
    return res.status(400).json({
      error: 'name must be unique'
    });
  }

  // new entry with details from req body
  const person = {
    id: generateRandomId(1, 100),
    name: body.name,
    number: body.number
  };

  // add the new entry
  persons = persons.concat(person);
  // return added entry
  res.json(person);
});

// middleware after routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
