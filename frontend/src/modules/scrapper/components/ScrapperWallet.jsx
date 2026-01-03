import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaExclamationCircle } from 'react-icons/fa';
import { usePageTranslation } from '../../../hooks/usePageTranslation';
import { earningsAPI } from '../../shared/utils/api';
import WebViewHeader from '../../shared/components/WebViewHeader';
import ScrapperBottomNav from './ScrapperBottomNav';

const ScrapperWallet = () => {
    const { user } = useAuth();
    const staticTexts = [
        "My Wallet",
        "Total Earnings",
        "Available Balance",
        "Pending Clearance",
        "Recent Transactions",
        "Withdraw",
        "Add Money",
        "No transactions yet",
        "Completed Pickup",
        "Withdrawal",
        "Refund",
        "Bonus",
        "Status",
        "Date",
        "Amount"
    ];

    const { getTranslatedText } = usePageTranslation(staticTexts);
    const [balance, setBalance] = useState({ available: 0, pending: 0, total: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                setLoading(true);
                // Fetch summary for balance
                const summaryRes = await earningsAPI.getSummary();
                if (summaryRes.success && summaryRes.data?.summary) {
                    const { total, today, week, month } = summaryRes.data.summary;
                    // Mocking separation of available vs pending for now based on total
                    setBalance({
                        available: total * 0.8, // 80% available
                        pending: total * 0.2,   // 20% pending
                        total: total
                    });
                }

                // Fetch history for transactions
                const historyRes = await earningsAPI.getHistory();
                if (historyRes.success && historyRes.data?.history) {
                    setTransactions(historyRes.data.history);
                }
            } catch (error) {
                console.error("Failed to fetch wallet data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-[#f4ebe2] pb-20">
            {/* Header for Mobile */}
            <div className="md:hidden sticky top-0 z-40 bg-[#f4ebe2]/80 backdrop-blur-md px-4 py-4 border-b border-emerald-900/10">
                <h1 className="text-xl font-bold text-gray-800">{getTranslatedText("My Wallet")}</h1>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8">

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FaWallet size={100} />
                    </div>

                    <div className="relative z-10">
                        <p className="text-emerald-100 text-sm font-medium mb-1">{getTranslatedText("Total Earnings")}</p>
                        <h2 className="text-4xl font-bold mb-6">₹{balance.total.toLocaleString()}</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-emerald-100 text-xs mb-1">{getTranslatedText("Available Balance")}</p>
                                <p className="text-xl font-semibold">₹{balance.available.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-emerald-100 text-xs mb-1">{getTranslatedText("Pending Clearance")}</p>
                                <p className="text-xl font-semibold">₹{balance.pending.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:bg-emerald-700 transition-colors">
                        <FaArrowUp />
                        {getTranslatedText("Withdraw")}
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white text-emerald-800 py-3 px-4 rounded-xl font-semibold shadow-md border border-emerald-100 hover:bg-gray-50 transition-colors">
                        <FaArrowDown />
                        {getTranslatedText("Add Money")}
                    </button>
                </div>

                {/* Transactions History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaHistory className="text-emerald-600" />
                        {getTranslatedText("Recent Transactions")}
                    </h3>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl p-4 h-20 animate-pulse" />
                            ))}
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map((tx, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {tx.type === 'withdrawal' ? <FaArrowUp /> : <FaArrowDown />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {tx.orderId ? `${getTranslatedText("Completed Pickup")} #${tx.orderId.slice(-4)}` : getTranslatedText("Top up")}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(tx.createdAt || tx.completedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-600'
                                            }`}>
                                            {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount || tx.totalAmount}
                                        </p>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            {tx.status || 'Completed'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                            <FaExclamationCircle className="mx-auto text-gray-300 mb-3" size={40} />
                            <p className="text-gray-500">{getTranslatedText("No transactions yet")}</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Mobile Bottom Nav is handled by the layout, but we ensure spacing is active */}
            <div className="md:hidden">
                <ScrapperBottomNav />
            </div>
        </div>
    );
};

export default ScrapperWallet;
