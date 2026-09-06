import Stripe from "stripe";
import config from "../config/index.js";

export const stripe = new Stripe(
	config.stripe.secret_key || "sk_test_placeholder_key_for_dev",
);
