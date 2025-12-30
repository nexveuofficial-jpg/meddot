import Image from "next/image";

export default function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "2rem",
      textAlign: "center",
      padding: "2rem"
    }}>
      <div style={{
        padding: "2rem",
        borderRadius: "1rem",
        background: "var(--muted)",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
      }}>
        <h1 style={{
          fontSize: "3rem",
          marginBottom: "1rem",
          background: "linear-gradient(to right, var(--primary), var(--secondary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Meddot
        </h1>
        <p style={{
          fontSize: "1.25rem",
          color: "var(--muted-foreground)",
          maxWidth: "40ch",
          marginBottom: "2rem"
        }}>
          The ultimate medical notes library and study platform. <br />
          <span style={{ fontWeight: 600, color: "var(--foreground)" }}>Coming Soon for Students.</span>
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a href="/login" style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            background: "var(--background)",
            color: "var(--foreground)",
            fontWeight: 500,
            transition: "all 0.2s"
          }}>
            Login
          </a>
          <a href="/signup" style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            background: "var(--primary)",
            color: "white",
            fontWeight: 500,
            boxShadow: "0 4px 6px -1px var(--primary-foreground)"
          }}>
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
