import { useEffect, useState } from "react";
import { getAllSOS } from "../services/api";
import SOSFeed from "../components/SOSFeed";
import toast   from "react-hot-toast";

export default function SOSPage() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSOS = async () => {
    try {
      const res = await getAllSOS();
      setSignals(res.data.signals);
    } catch {
      toast.error("Cannot reach backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 5000);
    return () => clearInterval(interval);
  }, []);

  const active   = signals.filter((s) => s.status === "ACTIVE");
  const resolved = signals.filter((s) => s.status === "RESOLVED");

  if (loading) return (
    <p className="text-gray-400 text-center mt-20">Loading...</p>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        🆘 SOS Feed
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Live incoming distress signals — auto refreshes every 5s
      </p>

      {/* Counts */}
      <div className="flex gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl
                        px-5 py-3 text-center">
          <p className="text-2xl font-bold text-red-600">{active.length}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl
                        px-5 py-3 text-center">
          <p className="text-2xl font-bold text-green-600">{resolved.length}</p>
          <p className="text-xs text-gray-500">Resolved</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl
                        px-5 py-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{signals.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      {/* Active signals */}
      <h3 className="font-semibold text-gray-700 mb-3">
        Active Signals
      </h3>
      <SOSFeed signals={signals} onRefresh={fetchSOS} />

      {/* Resolved signals */}
      {resolved.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 mb-3">
            ✅ Resolved Signals
          </h3>
          <div className="space-y-3">
            {resolved.map((s) => (
              <div key={s.id}
                className="bg-white border-l-4 border-green-400
                           rounded-xl p-4 shadow-sm opacity-70">
                <div className="flex justify-between">
                  <div>
                    <span className="bg-green-100 text-green-700 text-xs
                                     font-bold px-2 py-1 rounded-full mr-2">
                      RESOLVED
                    </span>
                    <span className="font-semibold text-gray-700">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{s.timestamp}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>📍 {s.location} · 👥 {s.people_count} people</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}