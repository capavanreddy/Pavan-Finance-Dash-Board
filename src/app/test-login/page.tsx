"use client";

import { useState } from "react";

export default function LoginTest() {
  const [result, setResult] = useState("");

  const testLogin = async () => {
    setResult("Testing...");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "pavanreddy@intellicar.in",
          password: "Test@123"
        }),
        credentials: "include",
      });

      const data = await response.json();
      setResult(JSON.stringify({ status: response.status, data }, null, 2));

      if (data.success) {
        setTimeout(() => {
          setResult(prev => prev + "\n\nRedirecting to /...");
          window.location.href = "/";
        }, 1000);
      }
    } catch (err) {
      setResult("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "monospace" }}>
      <h1>Login Test</h1>
      <button onClick={testLogin} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Test Login
      </button>
      <pre style={{ background: "#f0f0f0", padding: "20px", marginTop: "20px", overflowX: "auto" }}>
        {result}
      </pre>
    </div>
  );
}
