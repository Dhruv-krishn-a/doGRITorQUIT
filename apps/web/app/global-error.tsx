"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#000",
            color: "#fff",
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
            Critical System Error
          </h2>
          <p style={{ color: "#aaa", marginBottom: "32px" }}>
            A fatal error occurred that we couldn't recover from.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
