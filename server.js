const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dolavexadmin:kZfLwqBf7XD5Ub8N@cluster0.knlarmo.mongodb.net/dolavex?retryWrites=true&w=majority";
const JWT_SECRET = process.env.JWT_SECRET || "dolavex_2026_secret";
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI).then(()=>console.log("Mongo Connected")).catch(e=>console.log(e));

const UserSchema = new mongoose.Schema({
  phone: String,
  password: String,
  balance: {type: Number, default: 0}
});
const User = mongoose.model('User', UserSchema);

app.get('/', (req,res)=> res.send('Dolavex Backend Running 🚀'));

app.post('/api/register', async (req,res)=>{
  const {phone, password} = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({phone, password:hashed});
  const token = jwt.sign({id:user._id}, JWT_SECRET);
  res.json({token, user});
});

app.post('/api/login', async (req,res)=>{
  const {phone, password} = req.body;
  const user = await User.findOne({phone});
  if(!user) return res.status(400).json({error:"User not found"});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({error:"Wrong password"});
  const token = jwt.sign({id:user._id}, JWT_SECRET);
  res.json({token, user});
});

app.listen(PORT, ()=> console.log(`Running on ${PORT}`));
