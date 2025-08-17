import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", pass: "" });
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState({ email: false, pass: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passOk = form.pass.length >= 8;
  const formOk = emailOk && passOk;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formOk || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.pass
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const msg = data?.msg || `Error ${res.status}`;
        throw new Error(msg);
      }

      // Guarda token por si luego lo necesitas
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Ir al escritorio
      navigate("/escritorio");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <header className="login-header">
        <Link to="/" className="login-title-left">Página de inicio</Link>
        <h1 className="login-title-right">Iniciar sesión</h1>
      </header>

      <div className="login-bg" />

      <main className="login-main">
        <form className="login-card" onSubmit={onSubmit} noValidate>
          <h2 className="login-title">¡Qué bueno verte de vuelta!</h2>
          <p className="login-subtitle">Accede para continuar aprendiendo.</p>

          <label className="login-label" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`login-input ${touched.email && !emailOk ? "error" : ""}`}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            required
          />
          {touched.email && !emailOk && <span className="login-error">Ingresa un correo válido.</span>}

          <label className="login-label" htmlFor="pass">Contraseña</label>
          <div className="login-pass">
            <input
              id="pass"
              name="pass"
              type={showPass ? "text" : "password"}
              value={form.pass}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`login-input ${touched.pass && !passOk ? "error" : ""}`}
              placeholder="Mínimo 8 caracteres"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login-toggle btn-ghost"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPass ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {touched.pass && !passOk && (
            <span className="login-error">La contraseña debe tener al menos 8 caracteres.</span>
          )}

          {error && <div className="login-error global">{error}</div>}

          <div className="login-actions">
            <label className="login-remember">
              <input type="checkbox" /> Recuérdame
            </label>
            <Link className="login-link" to="/recuperar">¿Olvidaste tu contraseña?</Link>
          </div>

          <button className="btn login-submit" disabled={!formOk || loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>

          <p className="login-footer">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="login-link">Regístrate</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
