import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IntensityDataPoint } from '../types';

interface IntensityLineChartProps {
  data: IntensityDataPoint[];
  chartTitle: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-app-surface-alt shadow-md rounded border border-app">
        <p className="text-app-primary font-semibold">{`Fecha: ${label}`}</p>
        <p style={{color: payload[0].stroke }}>{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const IntensityLineChart: React.FC<IntensityLineChartProps> = ({ data, chartTitle }) => {
   if (!data || data.length === 0) {
    return (
      <div className="bg-app-surface p-4 rounded-lg shadow-lg h-96 flex flex-col justify-center items-center">
        <h3 className="text-xl font-semibold text-app-accent mb-4 text-center">{chartTitle}</h3>
        <p className="text-center text-app-secondary py-4">No hay datos de intensidad para mostrar para esta selección.</p>
      </div>
    );
  }
  return (
    <div className="bg-app-surface p-4 rounded-lg shadow-lg h-96">
       <h3 className="text-xl font-semibold text-app-accent mb-4 text-center">{chartTitle}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="fecha" 
            stroke="var(--color-text-secondary)"
            angle={-30} 
            textAnchor="end" 
            height={50}
            tick={{fontSize: '0.75rem', fill: 'var(--color-text-secondary)'}}
          />
          <YAxis domain={[0, 10]} allowDecimals={false} stroke="var(--color-text-secondary)" tick={{fill: 'var(--color-text-secondary)'}}/>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: '0.8rem', color: 'var(--color-text-secondary)'}} />
          <Line type="monotone" dataKey="intensidad" stroke="var(--color-accent-primary)" strokeWidth={2} activeDot={{ r: 8 }} name="Intensidad Prom."/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IntensityLineChart;
