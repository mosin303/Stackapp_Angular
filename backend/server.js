const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const Company = mongoose.model('Company', new mongoose.Schema({
  name: String
}));

const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  address: String,
  mobile: String,
  email: String,
  password: String,
  companies: [String]
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/meanstack', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API endpoints
app.post('/api/register', async (req, res) => {
  const { name, address, mobile, email, password, companies } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    address,
    mobile,
    email,
    password: hashedPassword,
    companies
  });

  await user.save();
  res.status(201).send({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).send({ message: 'Invalid password' });
  }

  const token = jwt.sign({ userId: user._id, companies: user.companies }, 'secret_key');
  res.send({ token });
});

app.get('/api/companies', async (req, res) => {
  const companies = await Company.find();
  res.send(companies);
});

// Start the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
