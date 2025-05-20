const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function checkBasicAuth(req, res) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).end('Unauthorized');
    return false;
  }
  const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [user, pass] = credentials.split(':');
  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).end('Unauthorized');
    return false;
  }
  return true;
}

let keys = {
  stripe: process.env.STRIPE_KEY || '',
  wise: process.env.WISE_KEY || '',
};

export default function handler(req, res) {
  if (!checkBasicAuth(req, res)) return;
  if (req.method === 'GET') {
    return res.status(200).json(keys);
  }
  if (req.method === 'POST') {
    const { stripe, wise } = req.body;
    keys.stripe = stripe;
    keys.wise = wise;
    // In production, persist to DB or secret manager
    return res.status(200).json({ success: true });
  }
  res.status(405).end();
} 