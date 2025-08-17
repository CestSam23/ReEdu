import { useState } from "react";
import "./signup.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SignupStepper() {
  const steps = [
    { id: 0, label: "¿Cómo te llamas?", type: "text", key: "name",  placeholder: "Tu nombre" },
    { id: 1, label: "Introduce tu correo", type: "email", key: "email", placeholder: "tucorreo@ejemplo.com" },
    { id: 2, label: "Crea una contraseña", type: "password", key: "pass",  placeholder: "Mín. 8 caracteres" },
  ];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", pass: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const current = steps[step];

  const onChange = (e) => {
    setError("");
    setForm({ ...form, [current.key]: e.target.value });
  };

  const validateStep = () => {
    if (current.key === "name" && form.name.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    if (current.key === "email" && !/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Correo no válido";
    }
    if (current.key === "pass" && form.pass.length < 8) {
      return "La contraseña debe tener mínimo 8 caracteres";
    }
    return "";
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.pass
        })
      });

      // Intenta parsear respuesta
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Mensaje del backend si existe; si no, genérico
        const msg = data?.msg || data?.errors?.[0]?.msg || `Error ${res.status}`;
        throw new Error(msg);
      }

      // Éxito
      alert(`✅ Cuenta creada: ${data.user.name} – ${data.user.email}`);
      window.location.href = "/login";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const next = async (e) => {
    e.preventDefault();
    const v = validateStep();
    if (v) return setError(v);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const back = () => {
    setError("");
    if (step > 0) setStep(step - 1);
  };

  return (
    <main className="page simple">
      <section className="stack">
        <h1 className="question">{current.label}</h1>

        <form onSubmit={next}>
          <input
            className="input"
            type={current.type}
            placeholder={current.placeholder}
            value={form[current.key]}
            onChange={onChange}
            autoFocus
            required
          />

          {error && <div className="error" role="alert">{error}</div>}
          {loading && <div className="muted">Creando cuenta...</div>}

          <div className="actions">
            <button className="btn ghost" type="button" onClick={back} disabled={step === 0 || loading}>
              Atrás
            </button>
            <button className="btn" type="submit" disabled={loading}>
              {step === steps.length - 1 ? "Crear cuenta" : "Siguiente"}
            </button>
          </div>
        </form>

        <button className="btn back" onClick={() => (window.location.href = "/")} disabled={loading}> Inicio</button>
        <p className="muted">
          ¿Ya tienes cuenta?{" "}
          <a className="login-link" href="/login">Inicia sesión</a>
        </p>
        <small className="muted">Paso {step + 1} de {steps.length}</small>
      </section>
    </main>
  );
}
