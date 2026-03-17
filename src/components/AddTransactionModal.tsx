import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = [
  { id: 'Food', icon: '🍔', label: 'Food' },
  { id: 'Transport', icon: '🚗', label: 'Transport' },
  { id: 'Bills', icon: '💡', label: 'Bills' },
  { id: 'Shopping', icon: '🛍️', label: 'Shopping' },
  { id: 'Health', icon: '⚕️', label: 'Health' },
  { id: 'Entertainment', icon: '🎬', label: 'Entertainment' },
  { id: 'Other', icon: '📦', label: 'Other' }
];

const INCOME_CATEGORIES = [
  { id: 'Salary', icon: '💰', label: 'Salary' },
  { id: 'Freelance', icon: '💻', label: 'Freelance' },
  { id: 'Investments', icon: '📈', label: 'Investments' },
  { id: 'Gifts', icon: '🎁', label: 'Gifts' },
  { id: 'Other Income', icon: '💵', label: 'Other' }
];

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Sync category selection when changing types
  React.useEffect(() => {
    if (type === 'expense') setCategory('Food');
    else setCategory('Salary');
  }, [type]);

  const addTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/transactions', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      
      toast.success('Transaction added successfully!');

      // Reset form
      setAmount('');
      setNote('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add transaction');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    // Explicitly cast type depending on if it matches schema
    addTransactionMutation.mutate({
      type,
      amount: Number(amount),
      category,
      note,
      date
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className={`fixed inset-x-0 bottom-0 z-50 bg-navy-900 rounded-t-[32px] sm:max-w-md sm:mx-auto shadow-2xl transition-transform transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} overflow-hidden border-t border-gray-800 pb-safe pb-4`}>
        
        {/* Drag handle */}
        <div className="w-full h-8 flex items-center justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
        </div>

        <div className="px-6 pb-6 mt-2">
          
          {/* Toggle Type */}
          <div className="flex bg-navy-800 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-colors text-sm ${type === 'expense' ? 'bg-red-900/50 text-red-100 shadow-sm border border-red-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-colors text-sm ${type === 'income' ? 'bg-green-900/50 text-green-100 shadow-sm border border-green-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              Income
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Amount Input */}
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm mb-1">How much?</span>
              <div className="flex items-center text-5xl font-bold bg-transparent">
                <span className="text-gray-500 mr-1">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full max-w-[200px] bg-transparent text-white placeholder-gray-700 outline-none text-center"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <p className="text-sm font-medium text-gray-400 mb-3 ml-1">Category</p>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all cursor-pointer ${
                      category === c.id 
                        ? type === 'expense' 
                            ? 'bg-red-900/40 border-red-500' 
                            : 'bg-green-900/40 border-green-500'
                        : 'bg-navy-800/50 border-transparent hover:border-gray-700 hover:bg-navy-800'
                    }`}
                  >
                    <span className="text-2xl mb-1">{c.icon}</span>
                    <span className="text-[10px] font-medium text-gray-300">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note & Date */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-navy-800 border border-gray-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="w-[140px]">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-navy-800 border border-gray-800 text-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={addTransactionMutation.isPending || !amount || Number(amount) <= 0}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {addTransactionMutation.isPending ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddTransactionModal;
