const express = require('express');
const cors = require('cors');
// const xssClean = require('xss-clean-node');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
// app.use(xssClean());

// Import Routes
app.get('/', (req, res) => {
    res.send("Welcome to Otix.....!");
});

const userRoutes = require('./routes/v1/user');
app.use('/v1/users', userRoutes);
const productRoutes = require('./routes/v1/product');
app.use('/v1/products', productRoutes);
const customerRoutes = require('./routes/v1/customer');
app.use('/v1/customers', customerRoutes);

const PORT = process.env.APP_HTTP_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
