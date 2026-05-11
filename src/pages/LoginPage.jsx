import { useState } from "react";
import { supabase } from "../supabase/supabaseClient.js"; // Siguraduhing tama ang path na ito
import { Link, useNavigate } from "react-router-dom"; // Idinagdag ang useNavigate

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      // SUCCESS! Redirect na tayo sa Inventory (Deliverable M4)
      console.log("Login success:", data);
      navigate("/inventory"); 
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { hd: "neu.edu.ph" },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
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
      fontFamily: "'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>

      {/* ── FULL BACKGROUND (GRADIENT BLUE) ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)",
        zIndex: 1,
      }} />

      {/* ── CENTERED WIDE CARD CONTAINER ── */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: "600px", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}>
        
        <div style={{ 
          width: "100%", 
          backgroundColor: "rgba(255, 255, 255, 0.96)", 
          padding: "56px 64px", 
          borderRadius: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(12px)", 
          border: "1px solid rgba(255, 255, 255, 0.4)",
        }}>

          {/* Logo + Title */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <img
              src="/logo.png"
              alt="HopeDB logo"
              style={{ width: "72px", height: "72px", objectFit: "contain", marginBottom: "16px" }}
            />
            <h1 style={{
              fontSize: "32px", 
              fontWeight: "700",
              color: "#1a1a2e",
              margin: "0 0 8px",
              fontFamily: "Georgia, serif",
            }}>
              Welcome to Hope PMS!
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
              Product Management System
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: "20px",
              padding: "14px 18px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              color: "#dc2626",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          {/* EMAIL/PASSWORD FORM */}
          <form onSubmit={handleEmailLogin} style={{ marginBottom: "24px" }}>
            <div style={{ marginBottom: "14px" }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1.5px solid #dadce0",
                  boxSizing: "border-box",
                  fontSize: "15px",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1.5px solid #dadce0",
                  boxSizing: "border-box",
                  fontSize: "15px",
                  outline: "none"
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#185FA5",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px"
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "28px 0", color: "#cbd5e1" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
            <span style={{ padding: "0 14px", fontSize: "13px", color: "#94a3b8", fontWeight: "bold" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              backgroundColor: "#ffffff",
              border: "1.5px solid #dadce0",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#3c4043",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-20 0-1.3-.2-2.7-.5-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z"/>
                <path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.9 36.1 27.1 37 24 37c-5.8 0-10.7-3.9-12.4-9.3l-7 5.4C8 40.5 15.4 45 24 45z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.8 6.3l6.6 5.4C41.7 37.1 45 31 45 24c0-1.3-.2-2.7-.5-4z"/>
              </svg>
            )}
            <span>{loading ? "Redirecting..." : "Sign in with Google"}</span>
          </button>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "32px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#185FA5", fontWeight: "600", textDecoration: "none" }}>
              Sign up!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}