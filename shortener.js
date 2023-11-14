const AWS = require('aws-sdk');
const mysql = require('mysql2');



const dbConnection = mysql.createConnection({
    host: "luxurypanelfacebok-do-user-14692811-0.c.db.ondigitalocean.com",
    port: "25060",
    user: "luxurypanelfacebok",
    password: "AVNS_tKp79z49hNQkGOPeTZk",
    database: "luxurypanelfacebok",
    charset: 'utf8mb4'
  });


AWS.config.update({
  region: 'tu-región-de-aws',
});

const dynamodb = new AWS.DynamoDB();

// Función para acortar una URL
function shortenUrl(longUrl) {
  // Genera una URL corta única (puedes usar un algoritmo de acortamiento personalizado)
  const shortUrl = 'short' + Math.random().toString(36).substring(7);

  // Guarda la URL en la base de datos MySQL
  const sql = 'INSERT INTO urls (longUrl, shortUrl) VALUES (?, ?)';
  dbConnection.query(sql, [longUrl, shortUrl], (err, result) => {
    if (err) {
      console.error('Error al guardar la URL en la base de datos MySQL:', err);
      return;
    }
    console.log('URL acortada y guardada en la base de datos MySQL:', shortUrl);
  });

  // Guarda la URL corta en DynamoDB o en otro servicio de tu elección
  const dynamoParams = {
    TableName: 'urls',
    Item: {
      shortUrl: { S: shortUrl },
      longUrl: { S: longUrl },
    },
  };

  dynamodb.putItem(dynamoParams, (err, data) => {
    if (err) {
      console.error('Error al guardar la URL corta en DynamoDB:', err);
      return;
    }
    console.log('URL corta guardada en DynamoDB:', shortUrl);
  });

  return shortUrl;
}

// Función para redirigir a una URL
function redirectToUrl(shortUrl, res) {
  // Busca la URL corta en la base de datos MySQL
  const sql = 'SELECT longUrl FROM urls WHERE shortUrl = ?';
  dbConnection.query(sql, [shortUrl], (err, result) => {
    if (err) {
      console.error('Error al buscar la URL en la base de datos MySQL:', err);
      return res.status(500).send('Error interno del servidor');
    }

    if (result.length === 0) {
      return res.status(404).send('URL no encontrada');
    }

    const longUrl = result[0].longUrl;
    console.log('Redirigiendo a:', longUrl);
    res.redirect(longUrl);
  });
}

module.exports = { shortenUrl, redirectToUrl };
