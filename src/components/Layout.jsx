import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            minHeight: "calc(100vh - 160px)",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            color: "#64748b",
            border: "1px solid #e2e8f0"
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}