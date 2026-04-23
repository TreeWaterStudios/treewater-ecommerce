import PocketBase from 'pocketbase';

export default async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing admin token' });
    }

    const pb = new PocketBase(process.env.POCKETBASE_URL);

    pb.authStore.save(token, null);

    await pb.collection('admins').authRefresh();

    const admin = pb.authStore.model;

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin session' });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ error: 'Admin account is inactive' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Admin authentication failed' });
  }
}
