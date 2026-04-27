"use client";

import { useState, useEffect } from "react";

export default function HomeHub() {
  const [content, setContent] = useState<any>({
    mission: "Empowering the Finance Team through transparency, real-time collaboration, and operational excellence.",
    stories: [
      { title: "Efficiency Boost", text: "The new matrix system has cut down our task allocation time by 40%", author: "Finance Admin" },
      { title: "Better Collaboration", text: "Sharing requests between departments is now seamless", author: "Operations Lead" }
    ],
    achievements: [
      { title: "Platform Launch", date: "Apr 2026", icon: "🚀" },
      { title: "100+ Tasks Completed", date: "", icon: "✨" }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/public-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.homeContent) {
            const parsed = JSON.parse(data.homeContent);
            // Merge with defaults if specific parts are missing
            setContent({
              mission: parsed.mission || content.mission,
              stories: parsed.stories && parsed.stories.length > 0 ? parsed.stories : content.stories,
              achievements: parsed.achievements && parsed.achievements.length > 0 ? parsed.achievements : content.achievements
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch home content", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc" }}>
        <div style={{ fontSize: "1rem", color: "#64748b", fontWeight: 500 }}>Loading workspace...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px", background: "#f8fafc" }}>
      {/* Mission Section */}
      <div style={{
        background: "#1e293b",
        borderRadius: "16px",
        padding: "48px",
        marginBottom: "32px",
        backgroundImage: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background accent */}
        <div style={{
          position: "absolute",
          right: "-50px",
          top: "-50px",
          width: "300px",
          height: "300px",
          background: "rgba(59, 130, 246, 0.1)",
          borderRadius: "50%",
          filter: "blur(100px)"
        }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#60a5fa",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ width: "24px", height: "2px", background: "#60a5fa" }} />
            OUR MISSION
          </div>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.3,
            marginBottom: "16px",
            maxWidth: "800px"
          }}>
            {content.mission}
          </h2>
          <p style={{
            fontSize: "1rem",
            color: "#cbd5e1",
            lineHeight: 1.6
          }}>
            This platform is implemented to drive efficiency and ensure every team member has the data they need to succeed.
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* Team Success Stories */}
        <div>
          <h3 style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "1.5rem" }}>👥</span>
            Team Success Stories
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {content.stories.map((item: any, idx: number) => (
              <div key={idx} style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "1.25rem",
                  color: "#3b82f6"
                }}>
                  {item.author?.[0] || "✓"}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", marginBottom: "4px" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
                    {item.text || item.description}
                  </p>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3b82f6", marginTop: "8px", textTransform: "uppercase" }}>
                    {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Major Achievements */}
        <div>
          <h3 style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "1.5rem" }}>💎</span>
            Major Achievements
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {content.achievements.map((item: any, idx: number) => (
              <div key={idx} style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "1.5rem"
                }}>
                  {item.icon || "✨"}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", marginBottom: "4px" }}>
                    {item.title}
                  </h4>
                  {item.date && (
                    <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {item.date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
