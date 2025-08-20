import { useEffect, useState } from 'react';
import { getBots } from '../../lib/api';
import type { Bot } from '../../lib/types';

export default function BotsPage(){
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBots().then(r => setBots(r.data)).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div>Carregando bots...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bots</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map(b => (
          <div key={b.id} className="bg-gray-900 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{b.name}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${b.status==='online'?'bg-green-500 text-black':'bg-gray-700'}`}>
                {b.status}
              </span>
            </div>
            <div className="text-sm text-gray-400 mt-1">{b.phone}</div>
            <div className="text-xs text-gray-500 mt-2">Criado em {new Date(b.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
