// import mongoose into app
const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

// build connection string
const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0-026ig.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

// establish connection
mongoose.connect(url, { useNewUrlParser: true });

// person schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

// model for person
const Person = mongoose.model('Person', personSchema);

// name & number passed in CL
let name = process.argv[3];
let number = process.argv[4];

// the document for a phonebook entry
const person = new Person({
  name: name,
  number: number
});

if (process.argv.length === 3) {
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(person);
    });
    mongoose.connection.close();
  });
} else {
  person.save().then(response => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
