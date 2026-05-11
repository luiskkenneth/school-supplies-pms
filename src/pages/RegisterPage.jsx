import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient.js"; 
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setError("");
      setLoading(true);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { hd: "neu.edu.ph" },
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",      
      justifyContent: "center",  
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      overflow: "hidden",
      backgroundColor: "#0f172a",
    }}>

      {/* ── BACKGROUND ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)",
        zIndex: 1,
      }} />

      {/* ── CARD ── */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: "600px", 
        padding: "24px",
      }}>
        
        <div style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.96)", 
          padding: "60px 64px", 
          borderRadius: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(12px)", 
          textAlign: "center"
        }}>

          {/* Logo Addition */}
          <div style={{ marginBottom: "40px" }}>
            <img
              src="/logo.png"
              alt="HopeDB logo"
              style={{ 
                width: "72px", 
                height: "72px", 
                objectFit: "contain", 
                marginBottom: "16px" 
              }}
            />
            <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 8px" }}>
              Create an Account
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
              Join HopeDB PMS using your NEU account
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "14px", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              backgroundColor: "#ffffff",
              border: "1.5px solid #dadce0",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#3c4043",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-20 0-1.3-.2-2.7-.5-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z"/>
              <path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.9 36.1 27.1 37 24 37c-5.8 0-10.7-3.9-12.4-9.3l-7 5.4C8 40.5 15.4 45 24 45z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.8 6.3l6.6 5.4C41.7 37.1 45 31 45 24c0-1.3-.2-2.7-.5-4z"/>
            </svg>
            <span>{loading ? "Connecting..." : "Register with Google"}</span>
          </button>

          <div style={{ marginTop: "32px", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#185FA5", fontWeight: "600", textDecoration: "none" }}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}