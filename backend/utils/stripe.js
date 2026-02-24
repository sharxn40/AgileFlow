const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn("STRIPE_SECRET_KEY is missing in .env file. Payment features will not work.");
}

module.exports = stripe;
