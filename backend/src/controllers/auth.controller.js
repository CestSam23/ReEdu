import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (uid) =>
  jwt.sign({ uid }, process.env.JWT_SECRET || "dev_key", { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, lang, access } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ ok: false, msg: "El correo ya está registrado" });

    const user = await User.create({
      name,
      email,
      password, // se hashea en pre('save')
      lang: lang || "es",
      access: { highContrast: access?.highContrast ?? false, easyRead: access?.easyRead ?? true }
    });

    const { password: _pw, ...safe } = user.toObject();
    res.status(201).json({ ok: true, user: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: "Error de servidor" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Buscar usuario
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(400).json({ ok: false, msg: "Credenciales inválidas" });

    // 2) Comparar pass con el hash guardado (tu modelo hace hash en pre-save)
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ ok: false, msg: "Credenciales inválidas" });

    // 3) Token (por si luego lo usas)
    const token = signToken(user._id.toString());
    const { password: _pw, ...safe } = user;
    res.json({ ok: true, token, user: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: "Error de servidor" });
  }
};
