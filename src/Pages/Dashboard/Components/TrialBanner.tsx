import React from "react";

interface TrialBannerProps {
  daysLeft: number;
  onUpgradeClick?: () => void;
  ctaIcon?: React.ReactNode;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ daysLeft, onUpgradeClick, ctaIcon }) => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full p-3">
            {/* Ícone decorativo inline para não depender de libs aqui */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 21h8M12 17v4M7 8l5-5 5 5" />
              <path d="M5 10h14v4a7 7 0 0 1-14 0v-4Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              Seu teste grátis expira em {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </h3>
            <p className="text-green-100 text-sm">
              Desbloqueie recursos premium e aumente suas conversões
            </p>
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center space-x-2"
        >
          {ctaIcon}
          <span>Assinar Agora</span>
        </button>
      </div>
    </div>
  );
};

export default TrialBanner;
