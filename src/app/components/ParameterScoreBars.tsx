import React from 'react';

interface Parameter {
  id: string;
  label: string;
  score: number;
  note?: string;
}

interface ParameterScoreBarsProps {
  parameters: Parameter[];
  showNotes?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-primary';
  if (score >= 60) return 'bg-accent';
  if (score >= 40) return 'bg-warning';
  return 'bg-danger';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Sangat Baik';
  if (score >= 60) return 'Cukup Baik';
  if (score >= 40) return 'Perlu Perhatian';
  return 'Buruk';
}

export default function ParameterScoreBars({ parameters, showNotes = false }: ParameterScoreBarsProps) {
  return (
    <div className="space-y-3">
      {parameters.map((param) => (
        <div key={param.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-600 text-foreground">{param.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{getScoreLabel(param.score)}</span>
              <span className="text-sm font-700 text-foreground font-tabular">{param.score}</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(param.score)}`}
              style={{ width: `${param.score}%` }}
            />
          </div>
          {showNotes && param.note && (
            <p className="text-[11px] text-muted-foreground italic pl-1">{param.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}