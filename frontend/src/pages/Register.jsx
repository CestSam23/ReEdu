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

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      alert(`Registro completo: ${form.name} – ${form.email}`);
      //probable back?
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <main className="page simple">
      <section className="stack">
        <h1 className="question">{current.label}</h1>

        <input
          className="input"
          type={current.type}
          placeholder={current.placeholder}
          value={form[current.key]}
          onChange={onChange}
          autoFocus
        />

        <div className="actions">
          <button className="btn ghost" onClick={back} disabled={step === 0}>Atrás</button>
          <button className="btn" onClick={next}>
            {step === steps.length - 1 ? "Crear cuenta" : "Siguiente"}
          </button>
        </div>

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
