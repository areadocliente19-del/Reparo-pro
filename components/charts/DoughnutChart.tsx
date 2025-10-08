import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartConfiguration, ChartItem } from 'chart.js';
Chart.register(...registerables);

interface ChartProps {
  config: ChartConfiguration;
}

const DoughnutChart: React.FC<ChartProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    chartRef.current = new Chart(ctx as ChartItem, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [config]);

  return <canvas ref={canvasRef}></canvas>;
};

export default DoughnutChart;
