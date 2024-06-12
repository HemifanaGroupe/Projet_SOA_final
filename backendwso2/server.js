require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de la connexion à la base de données
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  res.send('Bienvenue à l\'API de gestion de réservation de chambre!');
});

// Routes pour les clients
app.get('/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM client');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/clients/:numeroCli', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM client WHERE numeroCli = $1', [req.params.numeroCli]);
    if (result.rows.length === 0) return res.status(404).send('Client not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/clients', async (req, res) => {
  try {
    const { nomCli, prenomCli, adresseCli, mailCli, telCli } = req.body;
    const result = await pool.query(
      'INSERT INTO client (nomCli, prenomCli, adresseCli, mailCli, telCli) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nomCli, prenomCli, adresseCli, mailCli, telCli]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/clients/:numeroCli', async (req, res) => {
  try {
    const { nomCli, prenomCli, adresseCli, mailCli, telCli } = req.body;
    const result = await pool.query(
      'UPDATE client SET nomCli = $1, prenomCli = $2, adresseCli = $3, mailCli = $4, telCli = $5 WHERE numeroCli = $6 RETURNING *',
      [nomCli, prenomCli, adresseCli, mailCli, telCli, req.params.numeroCli]
    );
    if (result.rows.length === 0) return res.status(404).send('Client not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/clients/:numeroCli', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM client WHERE numeroCli = $1 RETURNING *', [req.params.numeroCli]);
    if (result.rows.length === 0) return res.status(404).send('Client not found');
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Routes pour les chambres
app.get('/chambres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chambre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/chambres/:numeroChambre', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chambre WHERE numeroChambre = $1', [req.params.numeroChambre]);
    if (result.rows.length === 0) return res.status(404).send('Chambre not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/chambres', async (req, res) => {
  try {
    const { nomChambre, prixChambre } = req.body;
    const result = await pool.query(
      'INSERT INTO chambre (nomChambre, prixChambre) VALUES ($1, $2) RETURNING *',
      [nomChambre, prixChambre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/chambres/:numeroChambre', async (req, res) => {
  try {
    const { nomChambre, prixChambre } = req.body;
    const result = await pool.query(
      'UPDATE chambre SET nomChambre = $1, prixChambre = $2 WHERE numeroChambre = $3 RETURNING *',
      [nomChambre, prixChambre, req.params.numeroChambre]
    );
    if (result.rows.length === 0) return res.status(404).send('Chambre not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/chambres/:numeroChambre', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM chambre WHERE numeroChambre = $1 RETURNING *', [req.params.numeroChambre]);
    if (result.rows.length === 0) return res.status(404).send('Chambre not found');
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Routes pour les réservations
app.get('/reservations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservation');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/reservations/:numeroRes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservation WHERE numeroRes = $1', [req.params.numeroRes]);
    if (result.rows.length === 0) return res.status(404).send('Reservation not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/reservations', async (req, res) => {
  try {
    const { numeroChambre, numeroCli, dateDeb, dateFin } = req.body;
    const result = await pool.query(
      'INSERT INTO reservation (numeroChambre, numeroCli, dateDeb, dateFin) VALUES ($1, $2, $3, $4) RETURNING *',
      [numeroChambre, numeroCli, dateDeb, dateFin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/reservations/:numeroRes', async (req, res) => {
  try {
    const { numeroChambre, numeroCli, dateDeb, dateFin } = req.body;
    const result = await pool.query(
      'UPDATE reservation SET numeroChambre = $1, numeroCli = $2, dateDeb = $3, dateFin = $4 WHERE numeroRes = $5 RETURNING *',
      [numeroChambre, numeroCli, dateDeb, dateFin, req.params.numeroRes]
    );
    if (result.rows.length === 0) return res.status(404).send('Reservation not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/reservations/:numeroRes', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reservation WHERE numeroRes = $1 RETURNING *', [req.params.numeroRes]);
    if (result.rows.length === 0) return res.status(404).send('Reservation not found');
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
