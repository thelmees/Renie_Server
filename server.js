const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const pool = require('./database')

const port = 4000

app.use(cors())
app.use(express.json())

const jwtToken = 'SecretKey'

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      jwt.verify(token, jwtToken, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };

app.post("/register",async(req,res) =>{
    const { username, password } = req.body;


const result = await pool.query(
    "INSERT INTO renie_bottles (username, password) VALUES ($1,$2) RETURNING *",[username,password]
  
)
.catch((err)=>{
    console.error(err.message)
})

    console.log(req.body);
    res.send('Response Received:' + req.body)
})


app.post("/login",async(req,res) =>{
    const { username, password } = req.body;
    
    try{
    const result = await pool.query(
        "SELECT * FROM renie_bottles WHERE username = $1",[username] )
const user = result.row[0];

    if(!user){
        const token = jwt.sign({ username: user.username, id: user.id }, jwtToken, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
  });



app.listen(port, ()=> console.log(`server listening on ${port}`))