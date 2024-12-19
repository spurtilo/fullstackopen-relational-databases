const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
  username: {
    type: String,
    minLength: 3,
    required: true,
    unique: true,
  },
  name: String,
  passwordHash: String,
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const updatedObject = {
      ...returnedObject,
      id: returnedObject._id.toString(),
    };
    delete updatedObject._id;
    delete updatedObject.__v;
    delete updatedObject.passwordHash;

    return updatedObject;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
