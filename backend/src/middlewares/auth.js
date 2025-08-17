import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, msg: 'Token requerido' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_key');
    req.uid = payload.uid;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'Token inválido o expirado' });
  }
};
