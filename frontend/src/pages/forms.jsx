import { useEffect, useState } from "react";
import "./forms.css";

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

// 0:R, 1:I, 2:A, 3:S, 4:E, 5:C
const QUESTION_DIM = [0,0,3,3,2,2, 4,4,1,1,5,5];
const RIASEC_LABELS = ["R","I","A","S","E","C"]; // (por si luego lo usas)
const SCORE_BY_OPTION_INDEX = [0,1,2,3,4];

const STORAGE_ANSWERS = "formAnswers";
const STORAGE_RIASEC  = "formRIASEC";

export default function Form() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [riasec, setRiasec] = useState(Array(6).fill(0));

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
    // 1) guardar respuesta
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
    localStorage.setItem(STORAGE_ANSWERS, JSON.stringify(newAnswers));

    // 2) sumar al eje RIASEC
    const dim = QUESTION_DIM[step];
    const optIndex = OPTIONS.indexOf(value);
    const score = SCORE_BY_OPTION_INDEX[optIndex] ?? 0;

    const newRiasec = [...riasec];
    newRiasec[dim] += score;
    setRiasec(newRiasec);
    localStorage.setItem(STORAGE_RIASEC, JSON.stringify(newRiasec));

    // 3) avanzar o terminar
    if (step === QUESTIONS.length - 1) {
      window.location.href = "/home";
    } else {
      setStep((s) => s + 1);
    }
  };

  const currentSelected = answers[step];

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

        <div className="actions">
          <button className="btn ghost" onClick={back} disabled={step === 0}>
            Atrás
          </button>
          <button
            className="btn"
            onClick={() => {
              if (!answers[step]) return;
              if (step === QUESTIONS.length - 1) {
                window.location.href = "/home";
              } else {
                setStep((s) => s + 1);
              }
            }}
          >
            {step === QUESTIONS.length - 1 ? "Finalizar" : "Siguiente"}
          </button>
        </div>

        <small className="muted">
          Pregunta {step + 1} de {QUESTIONS.length}
        </small>
      </section>
    </main>
  );
}
