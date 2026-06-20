import { useEffect, useRef } from 'react';
import type { FarmHealthScore } from '../lib/types';
import './CropHealthRing.css';

interface CropHealthRingProps {
  score: FarmHealthScore;
}

export const CropHealthRing = ({ score }: CropHealthRingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r1 = size * 0.42;
    const r2 = size * 0.34;
    const r3 = size * 0.26;

    ctx.clearRect(0, 0, size, size);

    // Draw concentric track rings (terracotta/clay — tawa metaphor)
    const rings = [
      { r: r1, trackColor: 'rgba(107,45,15,0.12)', fillColor: '#E8750A', value: score.overall },
      { r: r2, trackColor: 'rgba(31,107,69,0.12)', fillColor: '#3DAA72', value: score.crop_health },
      { r: r3, trackColor: 'rgba(74,144,217,0.12)', fillColor: '#4A90D9', value: score.weather_safety },
    ];

    rings.forEach(({ r, trackColor, fillColor, value }) => {
      // Track
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = trackColor;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Filled arc
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (value / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  }, [score]);

  const statusColor = {
    excellent: '#3DAA72',
    good: '#3DAA72',
    fair: '#D4A017',
    poor: '#C0392B',
  }[score.status];

  return (
    <div className="health-ring-container">
      <canvas ref={canvasRef} width={180} height={180} aria-label={`Farm health score: ${score.overall} out of 100`} />
      <div className="health-ring-center">
        <span className="health-score">{score.overall}</span>
        <span className="health-label" style={{ color: statusColor }}>{score.status_hindi}</span>
      </div>
      <div className="health-ring-legend">
        <span><span style={{ color: '#E8750A' }}>●</span> Overall</span>
        <span><span style={{ color: '#3DAA72' }}>●</span> Crop</span>
        <span><span style={{ color: '#4A90D9' }}>●</span> Weather</span>
      </div>
    </div>
  );
};
