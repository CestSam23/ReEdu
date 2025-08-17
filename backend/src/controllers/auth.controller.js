// src/controllers/auth.controller.js
import User from '../models/User.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, lang, access } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ ok: false, msg: 'El correo ya está registrado' });
    }

    const user = await User.create({
      name,
      email,
      password, // <--- se hashea en el pre-save
      // campos opcionales:
      lang: lang || 'es',
      access: {
        highContrast: access?.highContrast ?? false,
        easyRead: access?.easyRead ?? true
      }
    });

    // No regreses el password
    const { password: _pw, ...safeUser } = user.toObject();
    res.status(201).json({ ok: true, user: safeUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: 'Error de servidor' });
  }
};
