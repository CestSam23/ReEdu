import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./forms.css";

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const OPTIONS = [
  "No me interesa",
  "Me da igual",
  "Me parece interesante",
  "Me gusta la idea",
  "Me interesa mucho",
];

const QUESTIONS = [
  "Me interesa resolver problemas técnicos o trabajar con computadoras?",
  "Disfruto arreglar o construir cosas con mis manos.",
  "Me gusta ayudar a otras personas a resolver sus problemas.",
  "Me interesa enseñar o explicar temas a los demás.",
  "Me atrae crear cosas nuevas como música, arte o escritura.",
  "Prefiero actividades donde pueda expresarme de forma creativa",
  "Me gusta vender, convencer o liderar grupos.",
  "Me interesa emprender proyectos y tomar decisiones importantes.",
  "Me interesa investigar, analizar o trabajar con datos",
  "Me gusta aprender sobre ciencia o descubrir cómo funciona el mundo.",
  "Prefiero actividades organizadas y con reglas claras.",
  "Me interesa planear y ordenar información o procesos.",
];

// 0:R, 1:I, 2:A, 3:S, 4:E, 5:C (referencia local por si la usas en UI)
const QUESTION_DIM = [0,0,3,3,2,2, 4,4,1,1,5,5];
const RIASEC_LABELS = ["R","I","A","S","E","C"];
const SCORE_BY_OPTION_INDEX = [0,1,2,3,4];

const STORAGE_ANSWERS = "formAnswers";
const STORAGE_RIASEC  = "formRIASEC";

export default function Form() {
  const navigate = useNavigate();

  // si no hay sesión, manda a login
  useEffect(() => {
    const tk = localStorage.getItem("token");
    if (!tk) navigate("/login", { replace: true });
  }, [navigate]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [riasec, setRiasec] = useState(Array(6).fill(0));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // util: mapea texto de opción -> índice 0..4
  const optionIndexOf = useMemo(() => {
    const map = new Map(OPTIONS.map((t, i) => [t, i]));
    return (text) => map.get(text) ?? 0;
  }, []);

  useEffect(() => {
    try {
      const savedAns = JSON.parse(localStorage.getItem(STORAGE_ANSWERS));
      const savedRia = JSON.parse(localStorage.getItem(STORAGE_RIASEC));
      if (Array.isArray(savedAns) && savedAns.length === QUESTIONS.length) {
        setAnswers(savedAns);
        const firstUnanswered = savedAns.findIndex((x) => x === null);
        if (firstUnanswered !== -1) setStep(firstUnanswered);
      }
      if (Array.isArray(savedRia) && savedRia.length === 6) {
        setRiasec(savedRia);
      }
    } catch {/* no-op */}
  }, []);

  const back = () => step > 0 && setStep(step - 1);

  const handleSelect = (value) => {
    setError("");
    // 1) guardar respuesta local
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
    localStorage.setItem(STORAGE_ANSWERS, JSON.stringify(newAnswers));

    // 2) sumar al eje RIASEC local (para UI)
    const dim = QUESTION_DIM[step];
    const optIndex = optionIndexOf(value);
    const score = SCORE_BY_OPTION_INDEX[optIndex] ?? 0;
    const newRiasec = [...riasec];
    newRiasec[dim] += score;
    setRiasec(newRiasec);
    localStorage.setItem(STORAGE_RIASEC, JSON.stringify(newRiasec));

    // 3) avanzar
    if (step === QUESTIONS.length - 1) {
      onFinish(newAnswers);
    } else {
      setStep((s) => s + 1);
    }
  };

  // Envía TODO al backend cuando se finaliza
  const onFinish = async (finalAnswers) => {
    try {
      setSending(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay sesión. Inicia sesión e inténtalo de nuevo.");

      // construimos el payload que espera /api/form/riasec
      const payload = {
        answers: finalAnswers.map((optText, qIndex) => ({
          qIndex,
          optionIndex: optionIndexOf(optText), // 0..4
          optionText: optText || "",
        })),
      };

      const res = await fetch(`${API_URL}/api/form/riasec`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.msg || `Error ${res.status}`);
      }

      // opcional: podrías guardar los scores de vuelta si quieres
      // localStorage.setItem("riasecScoresServer", JSON.stringify(data.scores));

      // limpieza opcional del progreso local (si ya persististe)
      // localStorage.removeItem(STORAGE_ANSWERS);
      // localStorage.removeItem(STORAGE_RIASEC);

      // redirige a donde quieras (antes usabas /home)
      navigate("/escritorio", { replace: true });
    } catch (e) {
      console.error("[RIASEC] Error guardando:", e);
      setError(e.message || "No se pudo guardar el formulario en la base de datos.");
    } finally {
      setSending(false);
    }
  };

  const currentSelected = answers[step];
  const formOk = !!currentSelected;

  return (
    <main className="page simple">
      <section className="stack">
        <h1 className="question">{QUESTIONS[step]}</h1>

        <div style={{ display: "grid", gap: "var(--gap)" }}>
          {OPTIONS.map((opt) => {
            const selected = currentSelected === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="btn"
                disabled={sending}
                style={{
                  textAlign: "left",
                  border: selected ? "1px solid var(--input-bd)" : "1px solid transparent",
                  boxShadow: selected ? "0 0 0 3px var(--focus-ring)" : "none",
                  background: selected ? "rgba(255,255,255,0.10)" : "var(--btn-bg)",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {error && <div className="login-error global" style={{ marginTop: 12 }}>{error}</div>}

        <div className="actions">
          <button className="btn ghost" onClick={back} disabled={step === 0 || sending}>
            Atrás
          </button>
          <button
            className="btn"
            onClick={() => {
              if (!formOk || sending) return;
              if (step === QUESTIONS.length - 1) {
                onFinish(answers);
              } else {
                setStep((s) => s + 1);
              }
            }}
            disabled={!formOk || sending}
          >
            {sending ? "Guardando..." : step === QUESTIONS.length - 1 ? "Finalizar" : "Siguiente"}
          </button>
        </div>

        <small className="muted">Pregunta {step + 1} de {QUESTIONS.length}</small>
      </section>
    </main>
  );
}
