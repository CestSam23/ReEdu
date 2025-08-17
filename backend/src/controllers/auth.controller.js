// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Función para firmar el token JWT
const signToken = (uid) =>
  jwt.sign({ uid }, process.env.JWT_SECRET || "dev_key", { expiresIn: "7d" });

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

// Nueva función para login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(400).json({ ok: false, msg: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ ok: false, msg: "Credenciales inválidas" });

    const token = signToken(user._id.toString());
    const { password: _pw, ...safeUser } = user;
    return res.json({ ok: true, token, user: safeUser });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, msg: "Error de servidor" });
  }
};
