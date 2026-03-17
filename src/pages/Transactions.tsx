import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';

const CATEGORY_MAP: Record<string, { icon: string, color: string }> = {
  'Food': { icon: '🍔', color: 'bg-orange-500/20 text-orange-500' },
  'Transport': { icon: '🚗', color: 'bg-blue-500/20 text-blue-500' },
  'Bills': { icon: '💡', color: 'bg-yellow-500/20 text-yellow-500' },
  'Shopping': { icon: '🛍️', color: 'bg-pink-500/20 text-pink-500' },
  'Health': { icon: '⚕️', color: 'bg-red-500/20 text-red-500' },
  'Entertainment': { icon: '🎬', color: 'bg-purple-500/20 text-purple-500' },
  'Salary': { icon: '💰', color: 'bg-green-500/20 text-green-500' },
  'Freelance': { icon: '💻', color: 'bg-indigo-500/20 text-indigo-500' },
  'Investments': { icon: '📈', color: 'bg-teal-500/20 text-teal-500' },
  'Gifts': { icon: '🎁', color: 'bg-rose-500/20 text-rose-500' },
  'Other': { icon: '📦', color: 'bg-gray-500/20 text-gray-500' }
};

const getCategoryStyle = (category: string) => 
  CATEGORY_MAP[category] || { icon: '🪙', color: 'bg-gray-500/20 text-gray-500' };

const Transactions = () => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const { data: res, isLoading } = useQuery({
    queryKey: ['transactions-all'],
    queryFn: async () => {
      const response = await axiosInstance.get('/transactions?limit=100');
      return response.data;
    }
  });

  const transactions = res?.data || [];
  
  const filtered = transactions.filter((t: any) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  return (
    <div className="space-y-6 px-4 md:px-0 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Transactions
        </h1>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'income', 'expense'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                : 'bg-navy-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 pb-8">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((t: any) => {
            const isIncome = t.type === 'income';
            const style = getCategoryStyle(t.category);
            
            return (
              <div key={t._id} className="bg-navy-900 p-4 rounded-2xl flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${style.color}`}>
                    {style.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{t.category}</h4>
                    <p className="text-xs text-gray-400">{t.note || 'No note'} • {format(new Date(t.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${isIncome ? 'text-green-400' : 'text-white'}`}>
                    {isIncome ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-navy-900 rounded-3xl border border-gray-800">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-gray-400 font-medium">No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
