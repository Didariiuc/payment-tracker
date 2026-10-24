import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  Building2, 
  Users, 
  Plus, 
  Minus, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  CreditCard, 
  UserPlus, 
  ChevronRight, 
  X, 
  Check, 
  RefreshCw,
  FolderPlus,
  Calendar,
  Sparkles
} from 'lucide-react';

// Initial Mock Data
const INITIAL_CATEGORIES = [
  {
    id: 'box',
    name: '1. Box (Cash Box)',
    type: 'direct',
    icon: 'Wallet',
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    transactions: [
      { id: 't1', date: new Date().toISOString().split('T')[0], description: 'Emergency Cash Deposit', amount: 5000, type: 'IN' },
      { id: 't2', date: new Date().toISOString().split('T')[0], description: 'Grocery Expenses', amount: 1200, type: 'OUT' }
    ]
  },
  {
    id: 'ucb',
    name: '2. UCB Bank',
    type: 'direct',
    icon: 'Building2',
    color: 'bg-blue-600',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-400',
    transactions: [
      { id: 't3', date: new Date().toISOString().split('T')[0], description: 'Monthly Salary Credit', amount: 45000, type: 'IN' },
      { id: 't4', date: new Date().toISOString().split('T')[0], description: 'ATM Cash Withdrawal', amount: 5000, type: 'OUT' }
    ]
  },
  {
    id: 'brac',
    name: '3. BRAC Bank',
    type: 'direct',
    icon: 'CreditCard',
    color: 'bg-purple-600',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-400',
    transactions: [
      { id: 't5', date: new Date().toISOString().split('T')[0], description: 'Freelance Project Payment', amount: 18500, type: 'IN' },
      { id: 't6', date: new Date().toISOString().split('T')[0], description: 'Utility Bill Payment', amount: 3200, type: 'OUT' }
    ]
  },
  {
    id: 'manus_theke_pai',
    name: '4. Manus Theke Pai (Receivables)',
    type: 'nested',
    icon: 'Users',
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-400',
    people: [
      {
        id: 'p1',
        name: 'Rahim Ahmed',
        phone: '01700000000',
        transactions: [
          { id: 't7', date: new Date().toISOString().split('T')[0], description: 'Lent for phone purchase', amount: 10000, type: 'IN' },
          { id: 't8', date: new Date().toISOString().split('T')[0], description: 'Partial repayment received', amount: 3000, type: 'OUT' }
        ]
      },
      {
        id: 'p2',
        name: 'Karim Chowdhury',
        phone: '01800000000',
        transactions: [
          { id: 't9', date: new Date().toISOString().split('T')[0], description: 'Borrowed for rent', amount: 7500, type: 'IN' }
        ]
      },
      {
        id: 'p3',
        name: 'Sakib Hassan',
        phone: '01900000000',
        transactions: [
          { id: 't10', date: new Date().toISOString().split('T')[0], description: 'Lunch bill share', amount: 1500, type: 'IN' },
          { id: 't11', date: new Date().toISOString().split('T')[0], description: 'Paid back cash', amount: 1500, type: 'OUT' }
        ]
      }
    ]
  }
];

export default function App() {
  // LocalStorage state initialization
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('tracker_categories_data');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [activeTab, setActiveTab] = useState('box');
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  
  // Modals and UI State
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, IN, OUT

  // Form States
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'IN' // IN = (+) Money coming in/add balance, OUT = (-) Money going out/subtract
  });

  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [newCatName, setNewCatName] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('tracker_categories_data', JSON.stringify(categories));
  }, [categories]);

  // Set default selected person if nested tab is active
  useEffect(() => {
    const currentCat = categories.find(c => c.id === activeTab);
    if (currentCat && currentCat.type === 'nested' && currentCat.people && currentCat.people.length > 0) {
      if (!selectedPersonId || !currentCat.people.some(p => p.id === selectedPersonId)) {
        setSelectedPersonId(currentCat.people[0].id);
      }
    } else {
      setSelectedPersonId(null);
    }
  }, [activeTab, categories, selectedPersonId]);

  // Utility function to compute balance of a single transaction array
  const calculateTxTotal = (txList = []) => {
    return txList.reduce((acc, curr) => {
      const amt = Number(curr.amount) || 0;
      return curr.type === 'IN' ? acc + amt : acc - amt;
    }, 0);
  };

  // Compute breakdown calculations
  const totals = useMemo(() => {
    let grandTotal = 0;
    let totalIn = 0;
    let totalOut = 0;

    const categoryBreakdown = {};

    categories.forEach(cat => {
      let catTotal = 0;
      let catIn = 0;
      let catOut = 0;

      if (cat.type === 'direct') {
        (cat.transactions || []).forEach(t => {
          const val = Number(t.amount) || 0;
          if (t.type === 'IN') {
            catIn += val;
            catTotal += val;
          } else {
            catOut += val;
            catTotal -= val;
          }
        });
      } else if (cat.type === 'nested') {
        (cat.people || []).forEach(p => {
          (p.transactions || []).forEach(t => {
            const val = Number(t.amount) || 0;
            if (t.type === 'IN') {
              catIn += val;
              catTotal += val;
            } else {
              catOut += val;
              catTotal -= val;
            }
          });
        });
      }

      categoryBreakdown[cat.id] = {
        total: catTotal,
        in: catIn,
        out: catOut
      };

      grandTotal += catTotal;
      totalIn += catIn;
      totalOut += catOut;
    });

    return { grandTotal, totalIn, totalOut, categoryBreakdown };
  }, [categories]);

  // Active Category & Person references
  const currentCategory = categories.find(c => c.id === activeTab) || categories[0];
  const currentPerson = currentCategory?.type === 'nested' 
    ? (currentCategory.people || []).find(p => p.id === selectedPersonId)
    : null;

  // Active Transaction List (Direct vs Nested Person)
  const currentTransactions = useMemo(() => {
    if (!currentCategory) return [];
    if (currentCategory.type === 'direct') {
      return currentCategory.transactions || [];
    } else if (currentCategory.type === 'nested' && currentPerson) {
      return currentPerson.transactions || [];
    }
    return [];
  }, [currentCategory, currentPerson]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return currentTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.date.includes(searchTerm) ||
                            t.amount.toString().includes(searchTerm);
      const matchesType = filterType === 'ALL' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [currentTransactions, searchTerm, filterType]);

  // Add Transaction Handler
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.amount || isNaN(newTx.amount) || Number(newTx.amount) <= 0) return;

    const transactionItem = {
      id: 'tx_' + Date.now(),
      date: newTx.date || new Date().toISOString().split('T')[0],
      description: newTx.description.trim() || (newTx.type === 'IN' ? 'Money Added' : 'Money Spent'),
      amount: parseFloat(newTx.amount),
      type: newTx.type
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id !== currentCategory.id) return cat;

      if (cat.type === 'direct') {
        return {
          ...cat,
          transactions: [transactionItem, ...cat.transactions]
        };
      } else if (cat.type === 'nested' && selectedPersonId) {
        return {
          ...cat,
          people: cat.people.map(person => {
            if (person.id !== selectedPersonId) return person;
            return {
              ...person,
              transactions: [transactionItem, ...person.transactions]
            };
          })
        };
      }
      return cat;
    }));

    // Reset Form
    setNewTx({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'IN'
    });
    setIsAddTransactionOpen(false);
  };

  // Delete Transaction
  const handleDeleteTransaction = (txId) => {
    if (!window.confirm('are you sure you want to delete this transaction?')) return;

    setCategories(prev => prev.map(cat => {
      if (cat.id !== currentCategory.id) return cat;

      if (cat.type === 'direct') {
        return {
          ...cat,
          transactions: cat.transactions.filter(t => t.id !== txId)
        };
      } else if (cat.type === 'nested' && selectedPersonId) {
        return {
          ...cat,
          people: cat.people.map(person => {
            if (person.id !== selectedPersonId) return person;
            return {
              ...person,
              transactions: person.transactions.filter(t => t.id !== txId)
            };
          })
        };
      }
      return cat;
    }));
  };

  // Add Person to Nested Category
  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newPersonObj = {
      id: 'p_' + Date.now(),
      name: newPersonName.trim(),
      phone: newPersonPhone.trim() || 'N/A',
      transactions: []
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id === currentCategory.id) {
        return {
          ...cat,
          people: [...(cat.people || []), newPersonObj]
        };
      }
      return cat;
    }));

    setSelectedPersonId(newPersonObj.id);
    setNewPersonName('');
    setNewPersonPhone('');
    setIsAddPersonOpen(false);
  };

  // Delete Person
  const handleDeletePerson = (personId, personName) => {
    if (!window.confirm(`Are you sure you want to delete "${personName}" and all associated records?`)) return;

    setCategories(prev => prev.map(cat => {
      if (cat.id === currentCategory.id) {
        const updatedPeople = cat.people.filter(p => p.id !== personId);
        return { ...cat, people: updatedPeople };
      }
      return cat;
    }));

    if (selectedPersonId === personId) {
      const remaining = (currentCategory.people || []).filter(p => p.id !== personId);
      setSelectedPersonId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Add Custom Main Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const colors = [
      { bg: 'bg-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-400' },
      { bg: 'bg-rose-600', light: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-400' },
      { bg: 'bg-cyan-600', light: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-400' }
    ];
    const pickedColor = colors[Math.floor(Math.random() * colors.length)];

    const newCat = {
      id: 'cat_' + Date.now(),
      name: newCatName.trim(),
      type: 'direct',
      icon: 'Wallet',
      color: pickedColor.bg,
      lightBg: pickedColor.light,
      borderColor: pickedColor.border,
      textColor: pickedColor.text,
      transactions: []
    };

    setCategories(prev => [...prev, newCat]);
    setActiveTab(newCat.id);
    setNewCatName('');
    setIsAddCategoryOpen(false);
  };

  // Reset All App Data
  const handleResetData = () => {
    if (window.confirm('Reset all transaction data to initial defaults?')) {
      setCategories(INITIAL_CATEGORIES);
      setActiveTab('box');
      localStorage.removeItem('tracker_categories_data');
    }
  };

  // Helper for Category Icons
  const renderCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans antialiased pb-16">
      
      {/* HEADER BAR */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Total Payment Tracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                স্মার্ট হিসাব ও ব্যালেন্স ক্যালকুলেটর (৳ Taka)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-300" />
              New Category
            </button>
            <button
              onClick={handleResetData}
              title="Reset Data"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* OVERALL GRAND TOTAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Grand Balance Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg shadow-emerald-600/10 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <TrendingUp className="w-36 h-36" />
            </div>
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                Total Net Worth / Balance
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
                ৳ {totals.grandTotal.toLocaleString('en-BD')}
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-100/90 font-medium">
                <span className="bg-emerald-500/40 px-2 py-0.5 rounded-md mr-2">Live Aggregate</span>
                All Branches & Receivables Combined
              </div>
            </div>
          </div>

          {/* Total Cash In Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                Total Money In (+ In Flow)
              </span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                + ৳ {totals.totalIn.toLocaleString('en-BD')}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total deposits and incoming payments</p>
            </div>
          </div>

          {/* Total Cash Out Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                Total Money Out (- Out Flow)
              </span>
              <div className="p-2 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
                - ৳ {totals.totalOut.toLocaleString('en-BD')}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total withdrawals and outgoing expenses</p>
            </div>
          </div>

        </div>

        {/* MAIN CATEGORIES TAB NAVIGATION */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map((cat) => {
              const catSummary = totals.categoryBreakdown[cat.id] || { total: 0 };
              const isActive = activeTab === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    isActive 
                      ? `${cat.color} text-white shadow-md` 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {renderCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                      {cat.name}
                    </div>
                    <div className="text-sm font-bold">
                      ৳ {catSummary.total.toLocaleString('en-BD')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CATEGORY CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT PANEL: NESTED PEOPLE LIST (Only for "Manus Theke Pai" or nested types) */}
          {currentCategory.type === 'nested' && (
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-amber-500" />
                      ব্যক্তিদের তালিকা (Sub-Points)
                    </h3>
                    <p className="text-xs text-slate-400">কার কাছে কত টাকা পাবেন</p>
                  </div>
                  <button
                    onClick={() => setIsAddPersonOpen(true)}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-xs font-medium flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    নতুন নাম
                  </button>
                </div>

                {/* People List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {(currentCategory.people || []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      কোনো ব্যক্তির নাম যুক্ত করা হয়নি। "নতুন নাম" বাটনে ক্লিক করুন।
                    </div>
                  ) : (
                    currentCategory.people.map((person) => {
                      const personBalance = calculateTxTotal(person.transactions);
                      const isSelected = selectedPersonId === person.id;

                      return (
                        <div
                          key={person.id}
                          onClick={() => setSelectedPersonId(person.id)}
                          className={`group cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {person.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{person.name}</div>
                              <div className="text-xs text-slate-400">{person.phone}</div>
                            </div>
                          </div>

                          <div className="text-right flex items-center space-x-2">
                            <div>
                              <div className={`text-sm font-bold ${personBalance >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'}`}>
                                ৳ {personBalance.toLocaleString('en-BD')}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {person.transactions?.length || 0} টি লেনদেন
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePerson(person.id, person.name);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                              title="Delete person"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Category Total Footer Summary */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">
                  {currentCategory.name} মোট:
                </span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  ৳ {(totals.categoryBreakdown[currentCategory.id]?.total || 0).toLocaleString('en-BD')}
                </span>
              </div>
            </div>
          )}

          {/* RIGHT PANEL: TRANSACTIONS LOG & DETAILS */}
          <div className={`${currentCategory.type === 'nested' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm`}>
            
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white ${currentCategory.color}`}>
                    {currentCategory.name}
                  </span>
                  {currentCategory.type === 'nested' && currentPerson && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md">
                        {currentPerson.name}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                  লেনদেনের বিবরণী (Transactions Log)
                </h2>
              </div>

              {/* Sub-Point / Person Current Live Balance */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">বর্তমান ব্যালেন্স</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    ৳ {calculateTxTotal(currentTransactions).toLocaleString('en-BD')}
                  </div>
                </div>

                <button
                  onClick={() => setIsAddTransactionOpen(true)}
                  disabled={currentCategory.type === 'nested' && !currentPerson}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-md shadow-emerald-600/20 text-xs sm:text-sm flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  নতুন লেনদেন
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="বিবরণী, তারিখ বা পরিমাণ দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {['ALL', 'IN', 'OUT'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filterType === type 
                        ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {type === 'ALL' ? 'সব' : type === 'IN' ? '+ In (জমা)' : '- Out (খরচ)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2 overflow-y-auto max-h-[480px]">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <div className="text-slate-400 text-sm">
                    {currentCategory.type === 'nested' && !currentPerson
                      ? 'অনুগ্রহ করে বামপাশ থেকে একজন ব্যক্তি নির্বাচন করুন।'
                      : 'কোনো লেনদেনের তথ্য পাওয়া যায়নি।'}
                  </div>
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 rounded-xl transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${
                        tx.type === 'IN' 
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}>
                        {tx.type === 'IN' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {tx.description}
                        </div>
                        <div className="flex items-center text-xs text-slate-400 space-x-2 mt-0.5">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {tx.date}
                          </span>
                          <span>•</span>
                          <span className={`font-semibold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {tx.type === 'IN' ? '+ Cash In' : '- Cash Out'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-base font-extrabold ${
                          tx.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type === 'IN' ? '+' : '-'} ৳ {Number(tx.amount).toLocaleString('en-BD')}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </main>

      {/* MODAL 1: ADD TRANSACTION */}
      {isAddTransactionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setIsAddTransactionOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              নতুন লেনদেন যোগ করুন
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {currentCategory.name} {currentPerson ? `(${currentPerson.name})` : ''}
            </p>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              
              {/* Type Switcher: IN (+) vs OUT (-) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  টাইপ নির্বাচন করুন (Type)
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'IN' })}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                      newTx.type === 'IN' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ IN (জমা/যোগ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'OUT' })}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                      newTx.type === 'OUT' 
                        ? 'bg-rose-600 text-white shadow-md' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    <span>- OUT (খরচ/বিয়োগ)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  টাকার পরিমাণ (Amount ৳) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="যেমন: 500"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  বিবরণ (Description)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বেতন, নাস্তার বিল, ধার শোধ"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  তারিখ (Date)
                </label>
                <input
                  type="date"
                  value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTransactionOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  সেভ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PERSON (SUB-POINT) */}
      {isAddPersonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => setIsAddPersonOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              নতুন ব্যক্তির নাম যোগ করুন
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              "মানুষ থেকে পাই" লিস্টে নতুন ব্যক্তির সাব-পয়েন্ট তৈরি করুন
            </p>

            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  ব্যক্তির নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সাকিব হাসান"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  ফোন নম্বর (অপশনাল)
                </label>
                <input
                  type="text"
                  placeholder="01700000000"
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPersonOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD MAIN CATEGORY */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => setIsAddCategoryOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              নতুন মেইন ক্যাটাগরি তৈরি করুন
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              যেমন: Nagad, Bkash, Islami Bank ইত্যাদি
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  ক্যাটাগরির নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 5. bKash Personal"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}