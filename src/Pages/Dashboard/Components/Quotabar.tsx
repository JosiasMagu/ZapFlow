import React, { useMemo } from "react";

interface QuotaBarProps {
  name: string;
  used: number;
  limit: number;
  colorClass?: string; // ex.: "bg-blue-500"
}

const QuotaBar: React.FC<QuotaBarProps> = ({ name, used, limit, colorClass = "bg-green-500" }) => {
  const percentage = useMemo(() => (limit > 0 ? (used / limit) * 100 : 0), [used, limit]);
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 font-medium">{name}</span>
        <span className={`text-sm font-medium ${isNearLimit ? "text-orange-400" : "text-gray-400"}`}>
          {used}/{limit}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${isNearLimit ? "bg-orange-500" : colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default QuotaBar;
