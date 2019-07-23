require('dotenv').config();
const express = require('express');
const app = express();
const Person = require('./models/person');

// MIDDLEWARE

// without a body-parser, the body property would be undefined
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// logging request data using morgan
const morgan = require('morgan');

morgan.token('data', function(request) {
  return JSON.stringify(request.body);
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

app.get('/', (request, response) => {
  response.send('<h1>Part3</h1>');
});

// retrieve all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.send(persons.map(person => person.toJSON()));
  });
});

// retrieve one person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON());
      } else {
        response.status(204).end();
      }
    })
    .catch(error => next(error));
});

// display info
app.get('/info', (request, response) => {
  let message = `Phonebook has info for ${persons.length} people 
  --
  ${new Date()}`;
  response.send(message);
});

// delete a person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

// add a person
app.post('/api/persons/', (request, response) => {
  // person content in request body
  const body = request.body;

  // is info missing?
  if (!body.name && body.number) {
    // return crucial
    return response.status(400).json({
      error: 'name or number missing'
    });
  }

  // person document from Person model
  const person = Person({
    name: body.name,
    number: body.number
  });

  // save to db - .save() saves the document
  // response is sent only if the operation succeeded
  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON());
  });

  // does person with same name already exist?
  // const isAlreadyAdded = persons.find(person => person.name === body.name);
  // if (isAlreadyAdded) {
  //   return res.status(400).json({
  //     error: 'name must be unique'
  //   });
  // }
});

// unknown endpoints handling middleware - defined after HTTP request handlers!
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

// error-handling middleware

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  // error with id?
  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  // otherwise, pass to built-in handler
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
