export default function SettingsPage(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-green-500/20 rounded-xl p-4">
          <div className="font-semibold mb-2">Plano e Billing</div>
          <div className="text-gray-400 text-sm">Mostra plano atual e limites (placeholder).</div>
        </div>
        <div className="bg-gray-900 border border-green-500/20 rounded-xl p-4">
          <div className="font-semibold mb-2">Integrações</div>
          <div className="text-gray-400 text-sm">Kuenha, Webhook, API (placeholder com cards).</div>
        </div>
      </div>
    </div>
  );
}
