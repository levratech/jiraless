import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Manifest = {
  repo: string;
  url: string;
  views: any;
  updated: string;
};

export default function Cortex() {
  const [repos, setRepos] = useState<Manifest[]>([]);

  useEffect(() => {
    fetch("views/federated.json?_=" + Date.now())
      .then(res => res.json())
      .then(data => setRepos(data.manifests || []))
      .catch(() => setRepos([]));
  }, []);

  if (!repos.length) return <p className="p-4 text-sm text-gray-500">No federated manifests found.</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Cortex Board</h1>
      {repos.map((r) => (
        <div key={r.repo} className="border rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold">{r.repo}</h2>
          <p className="text-sm text-gray-600">Last updated {new Date(r.updated).toLocaleString()}</p>
          <Link to={`/r/${encodeURIComponent(r.repo)}`} className="text-blue-500 text-sm">Open Board ↗</Link>
        </div>
      ))}
    </div>
  );
}