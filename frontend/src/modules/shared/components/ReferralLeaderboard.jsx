import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAllReferrals, getUserReferralStats } from '../utils/referralUtils';
import {
  FaTrophy,
  FaMedal,
  FaAward,
  FaUsers,
  FaRupeeSign,
  FaCrown
} from 'react-icons/fa';

const ReferralLeaderboard = ({ userType = 'user', period = 'all' }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [userType, period]);

  const loadLeaderboard = () => {
    setLoading(true);
    const allReferrals = getAllReferrals();
    
    // Filter by user type
    const filteredReferrals = allReferrals.filter(
      ref => ref.referrerType === userType && ref.status === 'active'
    );
    
    // Group by referrer
    const referrerMap = {};
    filteredReferrals.forEach(ref => {
      const referrerId = ref.referrerId;
      if (!referrerMap[referrerId]) {
        referrerMap[referrerId] = {
          referrerId,
          totalReferrals: 0,
          totalEarnings: 0,
          referrals: []
        };
      }
      referrerMap[referrerId].totalReferrals++;
      const rewards = ref.rewards?.referrerRewards || [];
      const earnings = rewards.reduce((sum, r) => sum + (r.amount || 0), 0);
      referrerMap[referrerId].totalEarnings += earnings;
      referrerMap[referrerId].referrals.push(ref);
    });
    
    // Convert to array and sort
    let leaderboardData = Object.values(referrerMap);
    
    // Filter by period
    if (period === 'monthly') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      leaderboardData = leaderboardData.map(item => {
        const monthlyReferrals = item.referrals.filter(ref => 
          new Date(ref.createdAt) >= startOfMonth
        );
        return {
          ...item,
          totalReferrals: monthlyReferrals.length,
          totalEarnings: monthlyReferrals.reduce((sum, ref) => {
            const rewards = ref.rewards?.referrerRewards || [];
            return sum + rewards.reduce((s, r) => s + (r.amount || 0), 0);
          }, 0)
        };
      });
    }
    
    // Sort by total referrals (descending)
    leaderboardData.sort((a, b) => b.totalReferrals - a.totalReferrals);
    
    // Take top 50
    setLeaderboard(leaderboardData.slice(0, 50));
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) {
      return <FaCrown className="text-2xl" style={{ color: '#ffd700' }} />;
    } else if (rank === 2) {
      return <FaMedal className="text-2xl" style={{ color: '#c0c0c0' }} />;
    } else if (rank === 3) {
      return <FaAward className="text-2xl" style={{ color: '#cd7f32' }} />;
    }
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
        style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
      >
        {rank}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p style={{ color: '#718096' }}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <FaTrophy className="text-5xl mx-auto mb-4" style={{ color: '#cbd5e0' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: '#2d3748' }}>
            No Referrals Yet
          </h3>
          <p className="text-sm" style={{ color: '#718096' }}>
            Be the first to start referring!
          </p>
        </div>
      ) : (
        leaderboard.map((item, index) => {
          const rank = index + 1;
          return (
            <motion.div
              key={item.referrerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border flex items-center gap-4 ${
                rank <= 3 ? 'shadow-lg' : 'shadow'
              }`}
              style={{
                backgroundColor: rank <= 3 ? '#fef3c7' : '#ffffff',
                borderColor: '#e2e8f0'
              }}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(rank)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
                  >
                    <FaUsers style={{ color: '#64946e' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#2d3748' }}>
                      {userType === 'scrapper' ? 'Scrapper' : 'User'} #{item.referrerId.slice(-6)}
                    </p>
                    <p className="text-xs" style={{ color: '#718096' }}>
                      {item.totalReferrals} {item.totalReferrals === 1 ? 'referral' : 'referrals'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 mb-1">
                  <FaRupeeSign className="text-sm" style={{ color: '#64946e' }} />
                  <p className="font-bold text-lg" style={{ color: '#64946e' }}>
                    {item.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs" style={{ color: '#718096' }}>
                  Total Earnings
                </p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default ReferralLeaderboard;

