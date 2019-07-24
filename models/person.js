// MONGOOSE

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(result => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    unique: true,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true
  }
});

// formatting returned person objects
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

// Apply the uniqueValidator plugin to personSchema.
personSchema.plugin(uniqueValidator);

// exporting the Person model
// everything else will be invisible to module users
module.exports = mongoose.model('Person', personSchema);
