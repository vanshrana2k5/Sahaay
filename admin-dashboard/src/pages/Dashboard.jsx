import { useEffect, useState, useCallback, useRef } from "react";
import { getDashboard } from "../services/api";
import RiskBanner from "../components/RiskBanner";
import StatsPanel from "../components/StatsPanel";
import SOSFeed    from "../components/SOSFeed";
import MapView    from "../components/MapView";
import toast      from "react-hot-toast";
import axios      from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from "recharts";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const RISK_STYLES = {
  CRITICAL: "bg-red-100 text-red-800 border-red-400",
  HIGH:     "bg-red-100 text-red-700 border-red-300",
  MEDIUM:   "bg-yellow-100 text-yellow-700 border-yellow-300",
  LOW:      "bg-green-100 text-green-700 border-green-300",
};
const DISASTER_ICONS  = { flood:"🌊", earthquake:"🌍", heatwave:"🔥", air_quality:"💨" };
const DISASTER_LABELS = { flood:"Flood", earthquake:"Earthquake", heatwave:"Heatwave", air_quality:"Air Quality" };
const RISK_SCORE      = { LOW:20, MEDIUM:55, HIGH:90 };
const RISK_COLOR      = { CRITICAL:"#dc2626", HIGH:"#f97316", MEDIUM:"#eab308", LOW:"#22c55e" };

// ── India Geographic Data ─────────────────────────────────
const INDIA_BOUNDARY = { north:37.5, south:6.5, west:67.0, east:97.5 };
const INDIA_CENTER   = { lat:20.5937, lng:78.9629 };

const INDIA_OUTLINE = [
  [37.1,74.3],[36.2,75.9],[35.5,76.8],[34.7,77.4],[34.3,78.2],[33.1,79.1],
  [32.2,78.7],[31.1,78.9],[30.3,79.5],[29.6,80.3],[28.7,81.4],[27.8,82.1],
  [26.9,83.2],[26.1,84.0],[25.4,85.1],[24.8,86.0],[24.1,87.2],[23.5,88.0],
  [22.8,88.4],[22.0,88.9],[21.5,87.5],[20.8,86.7],[20.1,85.9],[19.4,84.8],
  [18.7,83.9],[17.9,83.2],[17.1,82.3],[16.4,81.4],[15.8,80.5],[15.1,80.0],
  [14.4,79.3],[13.8,78.5],[13.1,77.6],[12.5,76.9],[11.9,75.9],[11.3,75.2],
  [10.7,76.0],[10.1,76.8],[9.5,77.5],[8.9,78.1],[8.4,78.9],[8.1,77.3],
  [8.5,76.4],[9.0,75.5],[9.7,74.9],[10.2,73.9],[11.0,73.2],[12.0,72.5],
  [13.0,72.0],[14.2,72.5],[15.5,73.2],[16.5,73.5],[17.5,73.0],[18.5,72.8],
  [19.5,72.5],[20.5,72.0],[21.5,72.3],[22.5,72.7],[23.3,68.4],[23.8,68.0],
  [24.5,68.5],[25.2,67.9],[26.0,67.0],[26.8,67.5],[27.5,68.2],[28.2,69.1],
  [28.9,70.0],[29.7,70.8],[30.4,71.5],[31.2,72.3],[32.0,73.2],[33.0,74.0],
  [34.0,74.5],[34.8,75.5],[35.5,76.4],[36.2,76.9],[37.1,74.3],
];

const INDIA_STATES = {
  "Delhi":       { lat:28.6,  lng:77.2 }, "Mumbai":     { lat:19.1, lng:72.9 },
  "Bengaluru":   { lat:12.9,  lng:77.6 }, "Chennai":    { lat:13.1, lng:80.3 },
  "Kolkata":     { lat:22.6,  lng:88.4 }, "Hyderabad":  { lat:17.4, lng:78.5 },
  "Ahmedabad":   { lat:23.0,  lng:72.6 }, "Jaipur":     { lat:26.9, lng:75.8 },
  "Lucknow":     { lat:26.8,  lng:80.9 }, "Bhopal":     { lat:23.3, lng:77.4 },
  "Patna":       { lat:25.6,  lng:85.1 }, "Bhubaneswar":{ lat:20.3, lng:85.8 },
  "Raipur":      { lat:21.3,  lng:81.6 }, "Ranchi":     { lat:23.3, lng:85.3 },
  "Chandigarh":  { lat:30.7,  lng:76.8 }, "Shimla":     { lat:31.1, lng:77.2 },
  "Dehradun":    { lat:30.3,  lng:78.0 }, "Dispur":     { lat:26.1, lng:91.8 },
  "Shillong":    { lat:25.6,  lng:91.9 }, "Agartala":   { lat:23.8, lng:91.3 },
  "Kohima":      { lat:25.7,  lng:94.1 }, "Imphal":     { lat:24.8, lng:93.9 },
  "Itanagar":    { lat:27.1,  lng:93.6 }, "Gangtok":    { lat:27.3, lng:88.6 },
};

const UNION_TERRITORIES = {
  "Leh":         { lat:34.2,  lng:77.6 }, "Srinagar":   { lat:34.1, lng:74.8 },
  "Jammu":       { lat:32.7,  lng:74.9 }, "Puducherry": { lat:11.9, lng:79.8 },
  "Port Blair":  { lat:11.7,  lng:92.7 },
};

const CITY_COORDS = {
  "Ludhiana":    { lat:30.9,  lng:75.9 }, "Chandigarh": { lat:30.7, lng:76.8 },
  "Amritsar":    { lat:31.6,  lng:74.9 }, "Jalandhar":  { lat:31.3, lng:75.6 },
  "Delhi":       { lat:28.6,  lng:77.2 }, "Mumbai":     { lat:19.1, lng:72.9 },
  "Bengaluru":   { lat:12.9,  lng:77.6 }, "Chennai":    { lat:13.1, lng:80.3 },
  "Kolkata":     { lat:22.6,  lng:88.4 }, "Hyderabad":  { lat:17.4, lng:78.5 },
  "Ahmedabad":   { lat:23.0,  lng:72.6 }, "Jaipur":     { lat:26.9, lng:75.8 },
  "Lucknow":     { lat:26.8,  lng:80.9 }, "Patna":      { lat:25.6, lng:85.1 },
};

function geoToCanvas(lat, lng, W, H, PAD) {
  const x = PAD + ((lng - INDIA_BOUNDARY.west)  / (INDIA_BOUNDARY.east  - INDIA_BOUNDARY.west))  * (W - PAD*2);
  const y = PAD + ((INDIA_BOUNDARY.north - lat) / (INDIA_BOUNDARY.north - INDIA_BOUNDARY.south)) * (H - PAD*2);
  return [x, y];
}

// ── Animated India Radar ──────────────────────────────────
function AnimatedRadar({ predictions, sosSignals = [] }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const sweepXRef = useRef(0);
  const trailsRef = useRef([]);
  const timeRef   = useRef(0);

  const riskData = predictions
    ? Object.entries(predictions).map(([type, d]) => ({
        type, label: DISASTER_LABELS[type], icon: DISASTER_ICONS[type],
        risk: d?.risk_level || "LOW", score: RISK_SCORE[d?.risk_level] ?? 20,
        prob: d?.probability ?? 0,
      }))
    : [];

  const dominantRisk  = [...riskData].sort((a,b) => b.score - a.score)[0]?.risk  || "LOW";
  const dominantScore = [...riskData].sort((a,b) => b.score - a.score)[0]?.score || 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      if (!W || !H) { animRef.current = requestAnimationFrame(draw); return; }
      timeRef.current++;

      const PAD = Math.min(W * 0.06, H * 0.08);

      // Transparent — satellite image shows through
      ctx.clearRect(0, 0, W, H);

      // Dark overlay for readability
      ctx.fillStyle = "rgba(0,8,3,0.45)";
      ctx.fillRect(0, 0, W, H);

      // Vignette
      const vig = ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,H*0.85);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ── Lat/Lng grid ──────────────────────────────────────
      ctx.setLineDash([2, 10]);
      ctx.lineWidth = 0.5;
      for (let lat = 10; lat <= 35; lat += 5) {
        const [x1,y1] = geoToCanvas(lat, INDIA_BOUNDARY.west, W, H, PAD);
        const [x2   ] = geoToCanvas(lat, INDIA_BOUNDARY.east, W, H, PAD);
        ctx.strokeStyle = lat === 20 ? "rgba(0,255,80,0.18)" : "rgba(0,255,80,0.07)";
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y1); ctx.stroke();
        ctx.fillStyle = "rgba(0,255,80,0.28)";
        ctx.font = "8px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${lat}°N`, 4, y1+3);
      }
      for (let lng = 70; lng <= 95; lng += 5) {
        const [x1,y1] = geoToCanvas(INDIA_BOUNDARY.south, lng, W, H, PAD);
        const [  ,y2] = geoToCanvas(INDIA_BOUNDARY.north, lng, W, H, PAD);
        ctx.strokeStyle = lng === 80 ? "rgba(0,255,80,0.18)" : "rgba(0,255,80,0.07)";
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1,y2); ctx.stroke();
        ctx.fillStyle = "rgba(0,255,80,0.28)";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${lng}°E`, x1, H - 4);
      }
      ctx.setLineDash([]);
      ctx.textAlign = "left";

      // ── India map outline ─────────────────────────────────
      ctx.beginPath();
      INDIA_OUTLINE.forEach(([lat,lng], i) => {
        const [x,y] = geoToCanvas(lat, lng, W, H, PAD);
        i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.save();
      ctx.shadowColor = "#00ff80";
      ctx.shadowBlur  = 12;
      ctx.strokeStyle = "rgba(0,255,100,0.75)";
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();

      // ── State capital dots ────────────────────────────────
      Object.entries(INDIA_STATES).forEach(([, coords]) => {
        const [x,y] = geoToCanvas(coords.lat, coords.lng, W, H, PAD);
        ctx.save();
        ctx.fillStyle   = "rgba(0,255,80,0.25)";
        ctx.shadowColor = "#00ff80";
        ctx.shadowBlur  = 4;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // ── Union territory dots ──────────────────────────────
      Object.entries(UNION_TERRITORIES).forEach(([, coords]) => {
        const [x,y] = geoToCanvas(coords.lat, coords.lng, W, H, PAD);
        ctx.save();
        ctx.fillStyle = "rgba(0,180,255,0.3)";
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // ── India center crosshair ────────────────────────────
      const [cX,cY] = geoToCanvas(INDIA_CENTER.lat, INDIA_CENTER.lng, W, H, PAD);
      ctx.save();
      ctx.strokeStyle = "rgba(0,255,80,0.2)";
      ctx.lineWidth   = 0.8;
      ctx.setLineDash([3,6]);
      ctx.beginPath(); ctx.moveTo(cX-14,cY); ctx.lineTo(cX+14,cY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cX,cY-14); ctx.lineTo(cX,cY+14); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── Sweep line ────────────────────────────────────────
      const sweepX = sweepXRef.current;

      // Trail
      for (let i = 0; i < 55; i++) {
        const tx = sweepX - (i / 55) * Math.min(W * 0.28, 110);
        const al = (1 - i / 55) * 0.18;
        if (tx < PAD) continue;
        ctx.strokeStyle = `rgba(0,255,100,${al})`;
        ctx.lineWidth   = 2;
        ctx.beginPath(); ctx.moveTo(tx, PAD); ctx.lineTo(tx, H - PAD); ctx.stroke();
      }

      // Main sweep
      ctx.save();
      ctx.shadowColor = "#00ff80";
      ctx.shadowBlur  = 24;
      ctx.strokeStyle = "#00ff80";
      ctx.lineWidth   = 2;
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(sweepX, PAD); ctx.lineTo(sweepX, H - PAD); ctx.stroke();
      ctx.restore();

      // ── City markers ──────────────────────────────────────
      Object.entries(CITY_COORDS).forEach(([city, coords]) => {
        const [x,y] = geoToCanvas(coords.lat, coords.lng, W, H, PAD);
        const color = dominantRisk === "HIGH"   ? "#ff4444"
                    : dominantRisk === "MEDIUM" ? "#ffcc00" : "#00ff80";

        if (Math.abs(x - sweepX) < 3.5) {
          trailsRef.current.push({ x, y, alpha:1, risk:dominantRisk, score:dominantScore });
        }

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur  = dominantRisk === "HIGH" ? 18 : 8;
        ctx.fillStyle   = color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(x, y, dominantRisk === "HIGH" ? 5 : 3.5, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "rgba(0,255,80,0.7)";
        ctx.font      = `${Math.max(7, W*0.010)}px monospace`;
        ctx.fillText(city, x+5, y-3);
        ctx.restore();
      });

      // ── SOS blips ─────────────────────────────────────────
      sosSignals.forEach(sos => {
        if (!sos.latitude || !sos.longitude) return;
        const [x,y] = geoToCanvas(sos.latitude, sos.longitude, W, H, PAD);
        const pulse = Math.sin(timeRef.current * 0.1) * 0.5 + 0.5;

        ctx.save();
        ctx.strokeStyle = `rgba(255,50,50,${0.4 + pulse * 0.55})`;
        ctx.lineWidth   = 2;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur  = 20;
        ctx.beginPath(); ctx.arc(x, y, 7 + pulse * 12, 0, Math.PI*2); ctx.stroke();
        ctx.strokeStyle = `rgba(255,100,100,${0.2 + pulse * 0.2})`;
        ctx.beginPath(); ctx.arc(x, y, 14 + pulse * 8, 0, Math.PI*2); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle   = "#ff3333";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur  = 28;
        ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI*2); ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "rgba(255,80,80,0.95)";
        ctx.font      = `bold ${Math.max(9, W*0.013)}px monospace`;
        ctx.fillText(`SOS`, x+9, y+4);
        if (sos.name) {
          ctx.fillStyle = "rgba(255,150,150,0.8)";
          ctx.font      = `${Math.max(7, W*0.010)}px monospace`;
          ctx.fillText(sos.name, x+9, y+15);
        }
        ctx.restore();
      });

      // ── Fading blip trails ────────────────────────────────
      trailsRef.current = trailsRef.current.filter(t => t.alpha > 0);
      trailsRef.current.forEach(t => {
        const color = t.risk==="HIGH"   ? `rgba(255,60,60,${t.alpha})`
                    : t.risk==="MEDIUM" ? `rgba(255,200,0,${t.alpha})`
                    : `rgba(0,255,80,${t.alpha})`;
        const size = 5 + (t.score/100)*7;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur  = 24;
        ctx.fillStyle   = color;
        ctx.beginPath(); ctx.arc(t.x, t.y, size, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1;
        ctx.beginPath(); ctx.arc(t.x, t.y, size+(1-t.alpha)*32, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
        t.alpha -= 0.005;
      });

      // ── HUD corner brackets ───────────────────────────────
      const C = 22;
      ctx.strokeStyle = "rgba(0,255,80,0.35)";
      ctx.lineWidth   = 1.5;
      ctx.beginPath(); ctx.moveTo(7,7+C); ctx.lineTo(7,7); ctx.lineTo(7+C,7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-7-C,7); ctx.lineTo(W-7,7); ctx.lineTo(W-7,7+C); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7,H-7-C); ctx.lineTo(7,H-7); ctx.lineTo(7+C,H-7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-7-C,H-7); ctx.lineTo(W-7,H-7); ctx.lineTo(W-7,H-7-C); ctx.stroke();

      // ── HUD text ──────────────────────────────────────────
      const fs = Math.max(9, W*0.012);
      ctx.fillStyle = "rgba(0,255,80,0.45)";
      ctx.font      = `${fs}px monospace`;
      ctx.textAlign = "left";
      const scanPct = (((sweepX - PAD) / (W - PAD*2)) * 100).toFixed(0);
      ctx.fillText(`SCAN ${scanPct}%`, 12, H-22);
      ctx.fillText(`SOS: ${sosSignals.length} ACTIVE`, 12, H-8);
      ctx.textAlign = "right";
      ctx.fillText(new Date().toLocaleTimeString(), W-12, H-8);
      ctx.fillText("SAHAAY INDIA SURVEILLANCE", W-12, H-22);

      // Compass
      ctx.fillStyle = "rgba(0,255,80,0.55)";
      ctx.font      = `bold ${fs}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("N", W/2, PAD-8);
      ctx.fillText("S", W/2, H-PAD+16);
      ctx.textAlign = "left";
      ctx.fillText("W", PAD-22, H/2+4);
      ctx.textAlign = "right";
      ctx.fillText("E", W-PAD+22, H/2+4);
      ctx.textAlign = "left";

      sweepXRef.current += 1.2;
      if (sweepXRef.current > W - PAD) sweepXRef.current = PAD;

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", setSize);
    };
  }, [predictions, sosSignals]);

  return (
    <div className="w-full rounded-2xl border border-green-900/60 shadow-2xl overflow-hidden"
      style={{ boxShadow:"0 0 60px rgba(0,255,80,0.07),0 0 120px rgba(0,0,0,0.7)" }}>

      {/* Top bar */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-green-900/40"
        style={{ background:"rgba(0,10,4,0.9)" }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"/>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping absolute inset-0 opacity-50"/>
          </div>
          <span className="text-green-400 text-sm font-mono font-bold tracking-[0.2em]">
            SAHAAY SURVEILLANCE — INDIA
          </span>
          <span className="text-green-900 text-xs font-mono hidden md:block">
            {INDIA_BOUNDARY.south}°S–{INDIA_BOUNDARY.north}°N · {INDIA_BOUNDARY.west}°W–{INDIA_BOUNDARY.east}°E
          </span>
        </div>
        <div className="flex items-center gap-4">
          {sosSignals.length > 0 && (
            <span className="text-red-400 text-xs font-mono font-bold animate-pulse">
              ⚠ {sosSignals.length} SOS ACTIVE
            </span>
          )}
          <span className="text-green-700 text-xs font-mono">
            {new Date().toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>

      {/* Satellite background + canvas overlay */}
      <div className="relative w-full" style={{ paddingBottom:"54%" }}>
        {/* Real satellite imagery */}
        <img
          src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=67,6,98,38&bboxSR=4326&size=1200,648&imageSR=4326&format=jpg&f=image"
          alt="India Satellite"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter:"brightness(0.4) saturate(0.7) hue-rotate(140deg)" }}
        />
        {/* Green radar overlay using screen blend */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode:"screen" }}
        />
      </div>

      {/* Bottom legend */}
      <div className="px-5 py-3 border-t border-green-900/40"
        style={{ background:"rgba(0,10,4,0.9)" }}>
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-5 flex-wrap">
            {riskData.map(d => (
              <div key={d.type} className="flex items-center gap-1.5">
                <span className="text-base">{d.icon}</span>
                <div>
                  <p className="text-xs font-mono leading-none"
                    style={{ color:d.risk==="HIGH"?"#ff4444":d.risk==="MEDIUM"?"#ffcc00":"#00ff80" }}>
                    {d.risk}
                  </p>
                  <p className="text-xs text-green-900 font-mono">{d.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"/> State Capital
            </span>
            <span className="flex items-center gap-1.5 text-cyan-700">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"/> Union Territory
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"/> SOS Active
            </span>
            <span className="flex items-center gap-1.5 text-yellow-700">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/> Medium Risk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Risk Gauge ────────────────────────────────────────────
function RiskGauge({ score=0, level="LOW" }) {
  const color = RISK_COLOR[level] || "#22c55e";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${Math.min(score,100)} 100`} strokeLinecap="round"
            className="transition-all duration-700"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold mt-1" style={{ color }}>{level}</span>
    </div>
  );
}

// ── Prediction Trend ──────────────────────────────────────
function PredictionTrend({ history }) {
  if (!history.length) return null;
  const COLORS = { flood:"#3b82f6", earthquake:"#f59e0b", heatwave:"#ef4444", air_quality:"#8b5cf6" };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">📈 Prediction Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
          <XAxis dataKey="time" tick={{ fontSize:10 }}/>
          <YAxis domain={[0,100]} tick={{ fontSize:10 }}/>
          <Tooltip formatter={(v,n) => [`${v}/100`,n]}/>
          {Object.keys(COLORS).map(k => (
            <Area key={k} type="monotone" dataKey={k} stroke={COLORS[k]}
              fill={COLORS[k]} fillOpacity={0.1} strokeWidth={2} dot={false} name={DISASTER_LABELS[k]}/>
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 flex-wrap">
        {Object.entries(COLORS).map(([k,c]) => (
          <span key={k} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor:c }}/>
            {DISASTER_LABELS[k]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Disaster Predictions ──────────────────────────────────
function DisasterPredictions({ onHistory, sosSignals=[] }) {
  const [predictions, setPredictions] = useState(null);
  const [overallRisk, setOverallRisk] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [weather,     setWeather]     = useState(null);

  const runFetch = useCallback(async () => {
    setLoading(true);
    try {
      const wRes = await axios.get(`${BASE}/weather/Ludhiana`);
      const w    = wRes.data;
      setWeather(w);
      const inputs = {
        temperature_c:w.temperature??30, humidity_pct:w.humidity??65,
        wind_speed_kmh:w.wind_speed??12, rainfall_mm:w.rainfall??0,
        consecutive_rain_days:1, rainfall_7day_sum:(w.rainfall??0)*5,
        humidity_7day_avg:w.humidity??65, seismic_activity:0.5,
        ground_vibration:0.2, historical_quakes_5yr:1, fault_distance_km:100,
        depth_km:30, foreshock_count:0, heat_index:w.temperature??32,
        consecutive_hot_days:(w.temperature??0)>38?3:0,
        temp_7day_avg:w.temperature??29, temp_max_7day:(w.temperature??30)+3,
        pm2_5:45, pm10:80, aqi:75, wind_7day_avg:w.wind_speed??11,
      };
      const res   = await axios.post(`${BASE}/predict/all`, inputs);
      const preds = res.data.predictions;
      setPredictions(preds);
      setOverallRisk(res.data.overall_highest_risk);
      onHistory({
        time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        flood:       RISK_SCORE[preds.flood?.risk_level]??20,
        earthquake:  RISK_SCORE[preds.earthquake?.risk_level]??20,
        heatwave:    RISK_SCORE[preds.heatwave?.risk_level]??20,
        air_quality: RISK_SCORE[preds.air_quality?.risk_level]??20,
      });
    } catch {}
    finally { setLoading(false); }
  }, [onHistory]);

  useEffect(() => { runFetch(); }, [runFetch]);

  return (
    <div className="space-y-4 mb-6">
      <AnimatedRadar predictions={predictions} sosSignals={sosSignals}/>

      {!loading && predictions && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base">🤖 AI Disaster Predictions</h2>
              {weather && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Live weather · {weather.temperature}°C · {weather.humidity}% humidity · {weather.rainfall}mm rain
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {overallRisk && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${RISK_STYLES[overallRisk]}`}>
                  Overall: {overallRisk}
                </span>
              )}
              <button onClick={runFetch} className="text-xs text-blue-500 hover:underline">🔄 Refresh</button>
            </div>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {Object.entries(predictions).map(([type,data]) => {
              const risk = data?.risk_level || "LOW";
              return (
                <div key={type} className={`rounded-lg border p-3 ${RISK_STYLES[risk]}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg">{DISASTER_ICONS[type]}</span>
                    <span className="text-xs font-bold">{risk}</span>
                  </div>
                  <p className="text-sm font-semibold">{DISASTER_LABELS[type]}</p>
                  <p className="text-xs mt-1 opacity-75">{data?.probability}% confidence</p>
                  {["LOW","MEDIUM","HIGH"].map(level => (
                    <div key={level} className="mt-1">
                      <div className="flex justify-between text-xs opacity-60 mb-0.5">
                        <span>{level}</span><span>{data?.all_probabilities?.[level]||0}%</span>
                      </div>
                      <div className="bg-white bg-opacity-50 rounded h-1">
                        <div className={`h-1 rounded transition-all duration-700 ${
                          level==="HIGH"?"bg-red-500":level==="MEDIUM"?"bg-yellow-500":"bg-green-500"
                        }`} style={{ width:`${data?.all_probabilities?.[level]||0}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 rounded mb-4"/>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-gray-200 rounded-lg"/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const [signals,      setSignals]      = useState([]);
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tab,          setTab]          = useState("feed");
  const [activeCount,  setActiveCount]  = useState(0);
  const [wsStatus,     setWsStatus]     = useState("offline");
  const [predHistory,  setPredHistory]  = useState([]);

  const addHistory = useCallback((point) => {
    setPredHistory(prev => [...prev.slice(-19), point]);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getDashboard();
      setStats(res.data);
    } catch {
      toast.error("Cannot connect to backend");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const wsColor = { connected:"text-green-500", reconnecting:"text-yellow-500", offline:"text-red-400" }[wsStatus];
  const wsLabel = { connected:"● Live", reconnecting:"⟳ Reconnecting", offline:"✕ Offline" }[wsStatus];

  if (statsLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <p className="text-4xl mb-3 animate-bounce">🛡️</p>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading SAHAAY Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🛡️ SAHAAY</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin Rescue Dashboard</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {activeCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              🆘 {activeCount} Active SOS
            </span>
          )}
          <span className={`text-xs font-medium ${wsColor}`}>{wsLabel}</span>
          <button onClick={fetchStats}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition">
            🔄 Refresh
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-4 mb-6 items-start">
          <div className="flex-1">
            <RiskBanner risk={stats?.current_risk} reasons={stats?.risk_reasons}/>
          </div>
          {stats?.risk_score !== undefined && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-2">Risk Score</p>
              <RiskGauge score={stats.risk_score} level={stats.current_risk}/>
            </div>
          )}
        </div>

        <StatsPanel stats={stats}/>

        <DisasterPredictions onHistory={addHistory} sosSignals={signals}/>

        {predHistory.length > 1 && (
          <div className="mb-6">
            <PredictionTrend history={predHistory}/>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {[["feed",`🆘 SOS Feed (${activeCount})`],["map","🗺️ Live Map"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab===id
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {tab==="feed" && (
          <SOSFeed
            onRefresh={fetchStats}
            onActiveCountChange={setActiveCount}
            onWsStatusChange={setWsStatus}
            onSignalsChange={setSignals}
          />
        )}
        {tab==="map" && <MapView signals={signals}/>}
      </div>
    </div>
  );
}