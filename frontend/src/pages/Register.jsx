import { useState } from "react";
import "./signup.css";


export default function SignupStepper() {
  const steps = [
    { id: 0, label: "¿Cómo te llamas?", type: "text",     key: "name",  placeholder: "Tu nombre" },
    { id: 1, label: "Introduce tu correo", type: "email",  key: "email", placeholder: "tucorreo@ejemplo.com" },
    { id: 2, label: "Crea una contraseña", type: "password", key: "pass",  placeholder: "Mín. 8 caracteres" },
  ];

  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState({ name: "", email: "", pass: "" });

  const current = steps[step];

  const onChange = (e) => setForm({ ...form, [current.key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.pass
        })
      });

      const data = await response.json();
      console.log(data);
      alert(data.msg);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const next = async (e) => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await handleSubmit(e);
    }
  };

  const back = () => {
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
          />

          <div className="actions">
            <button className="btn ghost" type="button" onClick={back} disabled={step === 0}>Atrás</button>
            <button className="btn" type="submit">
              {step === steps.length - 1 ? "Crear cuenta" : "Siguiente"}
            </button>
          </div>
        </form>

        <button className="btn back" onClick={()=> window.location.href="/"} > Inicio</button>
        <p className="muted">
          ¿Ya tienes cuenta?{" "}
          <a className="login-link" href="/login">Inicia sesión</a>
        </p>
        <small className="muted">Paso {step + 1} de {steps.length}</small>
      </section>
    </main>
  );
}
