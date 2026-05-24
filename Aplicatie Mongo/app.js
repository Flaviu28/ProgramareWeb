require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_cheie_temporara',
    resave: false,
    saveUninitialized: false
}));

mongoose.connect('mongodb+srv://flaviu:flaviupemongo28@programareweb.5usdkds.mongodb.net/?appName=ProgramareWeb')
    .then(() => console.log('Conectat cu succes la MongoDB Atlas'))
    .catch(err => console.error('Eroare grava de conexiune DB:', err));
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const requireLogin = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
};
app.get('/register', (req, res) => res.render('register', { error: null }));

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await User.create({ username, email, password }); 
        res.redirect('/login');
    } catch (err) {
        if (err.code === 11000) { 
            return res.render('register', { error: 'Username-ul sau Email-ul este deja folosit' });
        }
        res.render('register', { error: err.message });
    }
});
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, username: user.username, role: user.role };
            return res.redirect('/');
        }
        res.render('login', { error: 'Date de identificare invalide' });
    } catch (err) {
        res.render('login', { error: 'A aparut o eroare la autentificare' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
app.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' }; 
        }
        let sortOption = {};
        if (req.query.sort === 'price_asc') sortOption.price = 1;
        if (req.query.sort === 'price_desc') sortOption.price = -1;
        const products = await Product.find(query).sort(sortOption).populate('createdBy', 'username email');
        res.render('index', { products, search: req.query.search || '', sort: req.query.sort || '' });
    } catch (err) {
        res.status(500).send("Eroare la preluarea datelor de pe server");
    }
});

app.get('/add', requireLogin, (req, res) => res.render('add', { error: null }));
app.post('/add', requireLogin, async (req, res) => {
    try {
        const { name, price, category, inStock } = req.body;
        await Product.create({
            name,
            price,
            category,
            inStock: inStock === 'on',
            createdBy: req.session.user.id
        });
        res.redirect('/');
    } catch (err) {
        res.render('add', { error: err.message }); 
    }
});

app.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).send('Formatul ID-ului nu este valid (404 Not Found)');
        }
        const product = await Product.findById(req.params.id).populate('createdBy', 'username email');
        if (!product) return res.status(404).send('Produsul cerut nu exista');
        res.render('details', { product });
    } catch (err) {
        res.status(500).send("Eroare server");
    }
});

app.get('/:id/edit', requireLogin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Produsul nu a fost gasit');
        res.render('edit', { product, error: null });
    } catch (err) {
        res.status(500).send("Eroare");
    }
});

app.post('/:id/edit', requireLogin, async (req, res) => {
    try {
        const { name, price, category, inStock } = req.body;
        await Product.findByIdAndUpdate(req.params.id, {
            name,
            price,
            category,
            inStock: inStock === 'on'
        }, { runValidators: true }); 
        res.redirect(`/${req.params.id}`);
    } catch (err) {
        const product = await Product.findById(req.params.id);
        res.render('edit', { product, error: err.message });
    }
});

app.post('/:id/delete', requireLogin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Eroare la stergerea elementului");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serverul ruleaza pe http://localhost:${PORT}`));