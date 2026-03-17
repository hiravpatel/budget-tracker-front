import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Analytics = () => {
  const [months, setMonths] = useState(6);

  const { data: monthlyRes } = useQuery({
    queryKey: ['analytics-monthly', months],
    queryFn: async () => {
      const res = await axiosInstance.get(`/analytics/monthly?months=${months}`);
      return res.data;
    }
  });

  const { data: categoryRes } = useQuery({
    queryKey: ['analytics-categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/analytics/categories');
      return res.data;
    }
  });

  const monthlyData = monthlyRes?.data || [];
  const categoryData = categoryRes?.data || [];

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const res = await axiosInstance.get(`/transactions/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-0 pb-12 md:pb-8">
      <div className="flex justify-between items-center md:pb-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Analytics
        </h1>
        <div className="space-x-2 flex">
          <button onClick={() => handleExport('csv')} className="bg-navy-800 hover:bg-navy-700 text-white border border-gray-700 font-medium px-4 py-2 rounded-xl shadow-sm transition-colors text-xs md:text-sm">
            CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="bg-navy-800 hover:bg-navy-700 text-white border border-gray-700 font-medium px-4 py-2 rounded-xl shadow-sm transition-colors text-xs md:text-sm">
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-900 p-6 rounded-3xl shadow-[0_0_15px_rgba(99,102,241,0.05)] border border-gray-800 h-80 md:h-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Trend</h3>
            <select className="p-1.5 border border-gray-800 rounded-lg bg-navy-800 text-gray-300 text-xs outline-none focus:border-primary-500" value={months} onChange={e => setMonths(Number(e.target.value))}>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1C243B" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
              <Tooltip cursor={{ fill: '#1C243B', opacity: 0.5 }} contentStyle={{ borderRadius: '16px', border: '1px solid #1F2937', backgroundColor: '#131A2A', color: '#F3F4F6' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={12} />
              <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-navy-900 p-6 rounded-3xl shadow-[0_0_15px_rgba(99,102,241,0.05)] border border-gray-800 h-80 flex flex-col items-center">
          <h3 className="text-lg font-bold text-white mb-2 w-full text-left">Spending</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #1F2937', backgroundColor: '#131A2A', color: '#F3F4F6' }} itemStyle={{ color: '#fff' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', marginTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
