export default function Escritorio() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <main style={{ padding: 24 }}>
      <h1>Escritorio</h1>
      <p>Bienvenido{user?.name ? `, ${user.name}` : ""} 👋</p>
      <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
{JSON.stringify(user, null, 2)}
      </pre>
      <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
        Cerrar sesión
      </button>
    </main>
  );
}