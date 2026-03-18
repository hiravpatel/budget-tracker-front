import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

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

const Dashboard = () => {

  const { data: transactionsRes } = useQuery({
    queryKey: ['transactions', { limit: 10 }],
    queryFn: async () => {
      const res = await axiosInstance.get('/transactions?limit=10');
      return res.data;
    }
  });

  const { data: monthlyRes } = useQuery({
    queryKey: ['analytics-monthly', 1],
    queryFn: async () => {
      const res = await axiosInstance.get('/analytics/monthly?months=1');
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

  const transactions = transactionsRes?.data || [];
  const currentMonth = monthlyRes?.data?.[0] || { income: 0, expense: 0 };
  const categories = categoryRes?.data || [];
  
  const totalBalance = currentMonth.income - currentMonth.expense;
  const savingsRate = currentMonth.income > 0 
    ? Math.round(((currentMonth.income - currentMonth.expense) / currentMonth.income) * 100) 
    : 0;
  const isGoodSavings = savingsRate >= 20;

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Main Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary-600 to-navy-800 rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(79,70,229,0.3)] relative overflow-hidden border border-white/10">
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>

          <div className="flex items-center space-x-2 text-primary-100 mb-2">
            <Wallet size={16} className="md:w-5 md:h-5" />
            <span className="text-sm md:text-base font-medium">Total Balance</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 md:mb-8 tracking-tight">
            ₹{totalBalance.toLocaleString()}
          </h1>

          <div className="flex space-x-4 md:space-x-8">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/5">
              <div className="flex items-center space-x-1 text-green-400 mb-1">
                <ArrowDownRight size={14} className="md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">Income</span>
              </div>
              <p className="text-lg md:text-2xl font-bold text-white">₹{currentMonth.income.toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/5">
              <div className="flex items-center space-x-1 text-red-400 mb-1">
                <ArrowUpRight size={14} className="md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">Expense</span>
              </div>
              <p className="text-lg md:text-2xl font-bold text-white">₹{currentMonth.expense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Savings Rate Widget */}
        <div className="bg-navy-900 rounded-3xl p-6 border border-gray-800 shadow-lg flex flex-col justify-center">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <span className="text-sm md:text-base font-medium text-gray-400">Savings Target (20%)</span>
            <span className={`text-2xl md:text-3xl font-bold ${isGoodSavings ? 'text-green-400' : 'text-amber-400'}`}>
              {savingsRate}%
            </span>
          </div>
          <div className="w-full bg-navy-950 rounded-full h-4 md:h-5 border border-gray-800 p-1">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isGoodSavings ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} 
              style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Horizontal Category Row (or grid on desktop) */}
        <div className="lg:col-span-1 lg:order-2">
          {categories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold text-white">Top Categories</h3>
                <span className="text-xs md:text-sm text-primary-400 font-medium cursor-pointer hover:text-primary-300">See all</span>
              </div>
              <div className="flex lg:grid lg:grid-cols-2 overflow-x-auto space-x-4 lg:space-x-0 lg:gap-4 pb-2 no-scrollbar">
                {categories.map((c: any) => {
                  const style = getCategoryStyle(c.name);
                  return (
                    <div key={c.name} className="flex flex-col items-center justify-center p-4 flex-shrink-0 w-24 lg:w-full bg-navy-900 border border-gray-800 hover:border-gray-700 transition-colors rounded-3xl">
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl mb-2 ${style.color}`}>
                        {style.icon}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-300 truncate w-full text-center">{c.name}</span>
                      <span className="text-[10px] md:text-xs text-gray-500 text-center font-medium mt-1">₹{c.value.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 lg:order-1 pb-8">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map((t: any) => {
              const isIncome = t.type === 'income';
              const style = getCategoryStyle(t.category);
              
              return (
                <div key={t._id} className="bg-navy-900 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-center space-x-4 md:space-x-5">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl ${style.color}`}>
                      {style.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white md:text-lg">{t.category}</h4>
                      <p className="text-xs md:text-sm text-gray-400">{t.note || 'No note'} • {format(new Date(t.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold md:text-xl ${isIncome ? 'text-green-400' : 'text-white'}`}>
                      {isIncome ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12 bg-navy-900 rounded-3xl border border-gray-800">
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-gray-500 font-medium">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
