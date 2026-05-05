"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1 style={{ color: "#ef4444" }}>Invalid or Missing Token</h1>
        <p>Please use the link provided in your email.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <CheckCircle2 size={64} color="#10b981" />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>Password Reset!</h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>Your password has been updated successfully. Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <img src="/logo.png" alt="Logo" style={{ width: '180px', height: 'auto', marginBottom: '16px' }} />
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Set New Password</h1>
        <p style={{ color: '#64748b' }}>Please enter your new secure password.</p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "14px", borderRadius: "12px", marginBottom: "24px", fontSize: "0.875rem", border: "1px solid #fee2e2" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: '0.875rem', fontWeight: 600, color: "#334155" }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: '0.875rem', fontWeight: 600, color: "#334155" }}>Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type={showPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "14px", 
            borderRadius: "12px", border: "none", fontWeight: 700, fontSize: '1rem',
            cursor: loading ? "not-allowed" : "pointer", marginTop: "12px",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc", padding: "20px" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 12px 12px 44px", borderRadius: "12px", border: "1px solid #e2e8f0", 
  fontSize: '1rem', outline: 'none', background: 'white'
};
