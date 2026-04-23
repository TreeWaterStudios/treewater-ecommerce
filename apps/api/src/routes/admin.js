import express from 'express';
import PocketBase from 'pocketbase';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const pb = new PocketBase(process.env.POCKETBASE_URL);

    const authData = await pb.collection('admins').authWithPassword(email, password);

    if (!authData?.record) {
      return res.status(401).json({ error: 'Invalid login' });
    }

    if (authData.record.isActive === false) {
      return res.status(403).json({ error: 'Admin account is inactive' });
    }

    res.json({
      token: authData.token,
      admin: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name || '',
        isActive: authData.record.isActive !== false,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const pb = new PocketBase(process.env.POCKETBASE_URL);
    pb.authStore.save(token, null);

    await pb.collection('admins').authRefresh();

    const admin = pb.authStore.model;

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name || '',
        isActive: admin.isActive !== false,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
