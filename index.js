require('dotenv').config()

const express = require('express')

const app = express()

// MIDDLEWARE

// without a body-parser, the body property would be undefined
const bodyParser = require('body-parser')

app.use(bodyParser.json())

// logging request data using morgan
const morgan = require('morgan')

morgan.token('data', request => JSON.stringify(request.body))

app.use(
  morgan(':method :url :status :res[content-length] - :response-time :data'),
)

// cors
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

// serve static files
app.use(express.static('build'))

app.get('/', (request, response) => {
  response.send('<h1>Part3 - Phonebook App</h1>')
})

// retrieve all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.send(persons.map(person => person.toJSON()))
  })
})

// retrieve one person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(204).end()
      }
    })
    .catch(error => next(error))
})

// display info
app.get('/info', (request, response, next) => {
  Person.countDocuments({}, (error, count) => {
    if (error) next(error)

    const message = `Phonebook has info for ${count} people 
    --
    ${new Date()}`
    response.send(message)
  })
})

// delete a person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// add a person
app.post('/api/persons/', (request, response, next) => {
  // person content in request body
  const { body } = request

  // is info missing?
  if (body.number === undefined || body.name === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }
  // person document from Person model
  const person = Person({
    name: body.name,
    number: body.number,
  })

  // save to db - .save() saves the document
  // response is sent only if the operation succeeded
  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => response.json(savedAndFormattedPerson))
    .catch(error => next(error))
})

// update existing contact
app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request
  // updated document
  const person = {
    name: body.name,
    number: body.number,
  }

  const { id } = request.params
  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => updatedPerson.toJSON())
    .then(formattedAndUpdatedPerson => response.json(formattedAndUpdatedPerson))
    .catch(error => next(error))
})

// unknown endpoints handling middleware - defined after HTTP request handlers!
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// error-handling middleware
const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  // error with id?
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  // none above? pass to built-in handler
  next(error)
}

app.use(errorHandler)

const { PORT } = process.env
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
