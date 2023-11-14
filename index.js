const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const crypto = require('crypto');


const app = express();


const db = mysql.createConnection({
  host: "db-mysql-nyc3-02969-do-user-13345650-0.c.db.ondigitalocean.com",
  port: "25060",
  user: "short",
  password: "AVNS_hbDoFngieW-kWNQEzuX",
  database: "short",
  charset: 'utf8mb4'
});

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Configura EJS como motor de plantillas
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  db.query('SELECT * FROM urls', (err, results) => {
    if (err) {
      console.error('Error al obtener las URLs:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.render('index', { urls: results });
  });
});

// Ruta para acortar una URL
app.post('/acortar', (req, res) => {
  const originalUrl = req.body.originalUrl;
  const shortUrl = crypto.randomBytes(3).toString('hex');

  db.query('INSERT INTO urls (original_url, short_url) VALUES (?, ?)', [originalUrl, shortUrl], (err) => {
    if (err) {
      console.error('Error al acortar la URL:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.redirect('/');
  });
});

// Ruta para redirigir a una URL acortada
app.get('/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;

  db.query('SELECT original_url FROM urls WHERE short_url = ?', [shortUrl], (err, results) => {
    if (err) {
      console.error('Error al redirigir a la URL original:', err);
      return res.status(500).send('Error en el servidor');
    }

    if (results.length === 0) {
      return res.status(404).send('URL no encontrada');
    }

    const originalUrl = results[0].original_url;
    res.redirect(originalUrl);
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
