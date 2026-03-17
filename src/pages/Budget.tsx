import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORY_MAP: Record<string, { icon: string, color: string }> = {
  'Food': { icon: '🍔', color: 'bg-orange-500/20 text-orange-500' },
  'Transport': { icon: '🚗', color: 'bg-blue-500/20 text-blue-500' },
  'Bills': { icon: '💡', color: 'bg-yellow-500/20 text-yellow-500' },
  'Shopping': { icon: '🛍️', color: 'bg-pink-500/20 text-pink-500' },
  'Health': { icon: '⚕️', color: 'bg-red-500/20 text-red-500' },
  'Entertainment': { icon: '🎬', color: 'bg-purple-500/20 text-purple-500' },
  'Other': { icon: '📦', color: 'bg-gray-500/20 text-gray-500' }
};

const getCategoryStyle = (category: string) => 
  CATEGORY_MAP[category] || { icon: '🪙', color: 'bg-gray-500/20 text-gray-500' };

const Budget = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: 'Food', limitAmount: '' });

  const { data: budgetSummaryRes } = useQuery({
    queryKey: ['budgets-summary'],
    queryFn: async () => {
      const res = await axiosInstance.get('/budgets/summary');
      return res.data;
    }
  });

  const addBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/budgets', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets-summary'] });
      setIsAdding(false);
      setNewBudget({ category: 'Food', limitAmount: '' });
      toast.success('Budget set successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to set budget');
    }
  });

  const budgets = budgetSummaryRes?.data || [];
  
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.limitAmount) return;
    
    addBudgetMutation.mutate({
      category: newBudget.category,
      limitAmount: Number(newBudget.limitAmount),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      alertThreshold: 0.8
    });
  };

  return (
    <div className="space-y-6 px-4 md:px-0 pb-12 md:pb-8">
      <div className="flex justify-between items-center md:pb-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Budgets
        </h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm bg-primary-600/20 hover:bg-primary-600/40 text-primary-400 font-medium px-4 py-2 rounded-xl border border-primary-500/30 transition-colors"
        >
          {isAdding ? 'Cancel' : '+ New Budget'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddBudget} className="bg-navy-900 border border-primary-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] p-5 md:p-6 rounded-3xl space-y-4 max-w-lg mx-auto md:mx-0">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-400 mb-1.5">Category</label>
            <select 
              className="w-full bg-navy-800 border border-gray-700 hover:border-gray-600 rounded-xl p-3 md:p-4 text-white outline-none focus:border-primary-500 transition-colors"
              value={newBudget.category} onChange={e => setNewBudget({...newBudget, category: e.target.value})}
            >
              {Object.keys(CATEGORY_MAP).filter(k => k !== 'Salary' && k !== 'Freelance' && k !== 'Investments' && k !== 'Gifts').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-400 mb-1.5">Monthly Limit (₹)</label>
            <input 
              type="number" required placeholder="5000"
              className="w-full bg-navy-800 border border-gray-700 hover:border-gray-600 rounded-xl p-3 md:p-4 text-white outline-none focus:border-primary-500 transition-colors"
              value={newBudget.limitAmount} onChange={e => setNewBudget({...newBudget, limitAmount: e.target.value})} 
            />
          </div>
          <button type="submit" disabled={addBudgetMutation.isPending} className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:to-purple-500 text-white font-bold py-3.5 md:py-4 rounded-xl disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            {addBudgetMutation.isPending ? 'Saving...' : 'Set Budget'}
          </button>
        </form>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {budgets.length > 0 ? budgets.map((b: any) => {
          const style = getCategoryStyle(b.category);
          const isOverLimit = b.percentUsed > 100;
          const isWarning = !isOverLimit && b.percentUsed > b.alertThreshold * 100;
          
          return (
            <div key={b.id || b.category} className="bg-navy-900 p-5 rounded-3xl border border-gray-800 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${style.color}`}>
                  {style.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{b.category}</h4>
                  <p className="text-xs text-gray-400">
                    ₹{b.spent.toLocaleString()} / ₹{b.limitAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${isOverLimit ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-green-500'}`}>
                    {b.percentUsed.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-navy-950 rounded-full h-2.5 border border-gray-800 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isOverLimit ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                    : isWarning ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                    : 'bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  }`} 
                  style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-12 bg-navy-900 rounded-3xl border border-gray-800 mt-4">
            <span className="text-4xl mb-3 block">🎯</span>
            <p className="text-gray-400 font-medium">No budgets set for this month.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
