const DEFAULT_STORE = {
  name: "Nova Commerce",
  logo: null,
  contactEmail: "hello@novacommerce.com",
  contactPhone: "+1 (555) 010-2000",
  currency: "USD",
  timezone: "America/New_York",
  address: {
    line1: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    postalCode: "62704",
    country: "US",
  },
};

const DEFAULT_PAYMENT_GATEWAYS = [
  { name: "stripe", label: "Stripe", enabled: true },
  { name: "paypal", label: "PayPal", enabled: true },
  { name: "cod", label: "Cash on Delivery", enabled: false },
];

const DEFAULT_SHIPPING = {
  defaultRate: 5.99,
  freeShippingThreshold: 75,
  zones: [
    { name: "Domestic", countries: ["US"], rate: 5.99 },
    { name: "International", countries: ["CA", "GB", "AU"], rate: 15.99 },
  ],
};

module.exports = { DEFAULT_STORE, DEFAULT_PAYMENT_GATEWAYS, DEFAULT_SHIPPING };
