const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1', 
  user: 'root',
  password: 'turaab2011',
  database: 'testdb'
});

db.connect(err => {
  if(err) console.log('DB connection error:', err);
  else console.log('Connected to database! Ab chala ja kaam kar.');
});


app.get('/', (req, res) => {
  res.send('<h1>Server is running!</h1><p>Use Postman to test /register and /login.</p>');
});

app.get('/login', (req, res) => {
  res.send('hogia dk bhao no tension');
});

app.get('/register', (req, res) => {
  res.send('jeo hogia theek dk bhai no tension.');
});
// -------------------------------------------------------

// REGISTER (POST)
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashpassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (name,email,password) VALUES (?,?,?)';

  db.query(query, [name, email, hashpassword], (err, result) => {
    if (err) {
      if(err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'Email pehlai sai hai' });
      else
        return res.status(500).json({ message: 'Server error araha' });
    }
    res.status(201).json({ message: 'Account bangia tera' });
  });
});

// LOGIN (POST)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (err, result) => {
    if(err) return res.status(500).json({ message: 'error hai bhai' });
    if(result.length === 0) return res.status(404).json({ message: 'nhi hai yara tu' });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(401).json({ message: 'galat hai bhai' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      'my_jwt_secret',
      { expiresIn: '2h' }
    );

    res.status(200).json({ message: 'hogia bhai', token });
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});