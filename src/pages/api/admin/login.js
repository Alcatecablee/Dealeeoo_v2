import { withSessionRoute } from '../../../lib/session';

const ADMIN_PASS = process.env.ADMIN_PASS;

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;

  if (password === ADMIN_PASS) {
    req.session.admin = { loggedIn: true };
    await req.session.save();
    return res.status(200).json({ success: true });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
}); 