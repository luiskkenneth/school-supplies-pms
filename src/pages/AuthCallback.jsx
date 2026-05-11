import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabase/supabaseClient.js";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      try {
        // 1. Agarang i-check ang current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session && mounted) {
          // Kung may session, lipat agad sa dashboard
          return navigate('/dashboard', { replace: true });
        }

        // 2. Kung walang session agad, makinig sa auth changes (backup)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (mounted && session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            navigate('/dashboard', { replace: true });
          } else if (event === 'SIGNED_OUT') {
            navigate('/login', { replace: true });
          }
        });

        return subscription;
      } catch (err) {
        console.error("Auth Error:", err.message);
        if (mounted) navigate('/login', { replace: true });
      }
    };

    const authSub = handleAuth();

    return () => {
      mounted = false;
      // Linisin ang subscription
      authSub.then(sub => sub?.unsubscribe?.());
    };
  }, [navigate]);

  return (
    <div style={containerStyle}>
      <div style={loadingWrapper}>
        <div style={spinnerOuter}>
          <div style={spinnerInner}></div>
          <img src="/logo.png" style={logoInSpinner} alt="HopeDB Logo" />
        </div>

        <div style={textWrapper}>
          <h2 style={titleStyle}>Verifying Session</h2>
          <p style={subtitleStyle}>Logging you in, please wait...</p>
        </div>
      </div>

      <div style={footerStyle}>
        <p style={brandStyle}>HopeDB PMS</p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// --- STYLES (Cleaned up for performance) ---
const containerStyle = { minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", fontFamily: "'Segoe UI', sans-serif", textAlign: "center", padding: "20px" };
const loadingWrapper = { display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" };
const spinnerOuter = { position: "relative", width: "100px", height: "100px" };
const spinnerInner = { width: "100px", height: "100px", borderRadius: "50%", border: "5px solid #e2e8f0", borderTop: "5px solid #185FA5", animation: "spin 0.8s linear infinite" };
const logoInSpinner = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "40px", height: "40px", objectFit: "contain" };
const textWrapper = { display: "flex", flexDirection: "column", gap: "8px" };
const titleStyle = { fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 };
const subtitleStyle = { fontSize: "15px", color: "#64748b", margin: 0, maxWidth: "300px", lineHeight: "1.5" };
const footerStyle = { position: "absolute", bottom: "40px", letterSpacing: "0.4em", opacity: "0.5" };
const brandStyle = { fontSize: "12px", fontWeight: "800", color: "#1e3a8a", margin: 0, textTransform: "uppercase" };