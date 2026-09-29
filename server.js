const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// XAMPP defaults: user "root", empty password
const db = mysql.createPool({
  host: '127.0.0.1',   // use 127.0.0.1, not 'localhost' (avoids IPv6 problems on newer Node)
  port: 3306,          // change to 3307 if XAMPP shows a different MySQL port
  user: 'root',
  password: '',
  database: 'expense_tracker',
  dateStrings: true
});

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Server error. Is MySQL running in XAMPP, and did you import database.sql?' });
  });

// Builds GET all / GET one / POST / PUT / DELETE for one table
function crud(route, table, columns, orderBy, check) {
  const base = '/api/' + route;
  const pick = (b) => columns.map((c) => b[c]);

  app.get(base, wrap(async (req, res) => {
    const [rows] = await db.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
    res.json(rows);
  }));

  app.get(base + '/:id', wrap(async (req, res) => {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  }));

  app.post(base, wrap(async (req, res) => {
    const problem = check(req.body);
    if (problem) return res.status(400).json({ error: problem });
    const cols = columns.map((c) => '`' + c + '`').join(', ');
    const [r] = await db.query(
      `INSERT INTO ${table} (${cols}) VALUES (${columns.map(() => '?').join(', ')})`, pick(req.body));
    res.status(201).json({ id: r.insertId });
  }));

  app.put(base + '/:id', wrap(async (req, res) => {
    const problem = check(req.body);
    if (problem) return res.status(400).json({ error: problem });
    const sets = columns.map((c) => '`' + c + '` = ?').join(', ');
    await db.query(`UPDATE ${table} SET ${sets} WHERE id = ?`, [...pick(req.body), req.params.id]);
    res.json({ ok: true });
  }));

  app.delete(base + '/:id', wrap(async (req, res) => {
    await db.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
    res.json({ ok: true });
  }));
}

crud('expenses', 'expenses', ['description', 'category', 'amount', 'expense_date'],
  'expense_date DESC, id DESC',
  (b) => (b.description && b.category && b.expense_date && Number(b.amount) > 0)
    ? null : 'Fill in all fields. Amount must be above 0.');

crud('foods', 'foods', ['name', 'price'], 'id',
  (b) => (b.name && b.price !== '' && Number(b.price) >= 0)
    ? null : 'Food name and a price of 0 or more are required.');

crud('movies', 'movies', ['title', 'genre', 'year'], 'id',
  (b) => {
    const missing = [];
    if (!b.title) missing.push('Title');
    if (!b.genre) missing.push('Genre');
    if (!b.year) missing.push('Year');
    return missing.length ? missing.join(', ') + ' are required' : null;
  });

app.listen(3000, async () => {
  console.log('Running at http://localhost:3000');
  // File check: every file must sit directly inside the public folder
  ['index.html', 'expenses.html', 'expense-form.html', 'foods.html', 'movies.html', 'style.css', 'common.js']
    .forEach((f) => {
      if (!fs.existsSync(path.join(__dirname, 'public', f)))
        console.log('MISSING FILE: public/' + f);
    });
  try {
    const [tables] = await db.query('SHOW TABLES');
    const names = tables.map((t) => Object.values(t)[0]);
    console.log('Database connected. Tables found:', names.join(', ') || '(none)');
    ['expenses', 'foods', 'movies'].forEach((t) => {
      if (!names.includes(t)) console.log(`MISSING TABLE: ${t} - run database.sql in phpMyAdmin`);
    });
  } catch (err) {
    console.log('DATABASE CONNECTION FAILED:', err.code, '-', err.message);
  }
});