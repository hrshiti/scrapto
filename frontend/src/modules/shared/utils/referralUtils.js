/**
 * Referral System Utility Functions
 * Handles referral code generation, validation, and localStorage management
 */

/**
 * Generate a unique referral code
 * Format: USER-XXXXXX or SCRAP-XXXXXX (6 alphanumeric characters)
 */
export const generateReferralCode = (userType = 'user') => {
  const prefix = userType === 'scrapper' ? 'SCRAP' : 'USER';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Generate 6 random alphanumeric characters
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${code}`;
};

/**
 * Validate referral code format
 */
export const isValidReferralCodeFormat = (code) => {
  if (!code || typeof code !== 'string') return false;
  const pattern = /^(USER|SCRAP)-[A-Z0-9]{6}$/;
  return pattern.test(code.toUpperCase());
};

/**
 * Get or generate referral code for a user/scrapper
 */
export const getOrGenerateReferralCode = (userId, userType = 'user') => {
  const storageKey = userType === 'scrapper' 
    ? 'scrapperReferralCode' 
    : 'userReferralCode';
  
  const codeMapKey = userType === 'scrapper'
    ? 'scrapperReferralCodes'
    : 'userReferralCodes';
  
  // Check if user already has a code
  const existingCode = localStorage.getItem(storageKey);
  if (existingCode) {
    return existingCode;
  }
  
  // Generate new code
  let code = generateReferralCode(userType);
  
  // Ensure uniqueness (check against existing codes)
  const existingCodes = JSON.parse(localStorage.getItem(codeMapKey) || '{}');
  let attempts = 0;
  while (existingCodes[code] && attempts < 10) {
    code = generateReferralCode(userType);
    attempts++;
  }
  
  // Store the code
  localStorage.setItem(storageKey, code);
  existingCodes[code] = {
    userId,
    userType,
    createdAt: new Date().toISOString(),
    totalReferrals: 0,
    totalEarnings: 0
  };
  localStorage.setItem(codeMapKey, JSON.stringify(existingCodes));
  
  return code;
};

/**
 * Validate referral code and get referrer info
 */
export const validateReferralCode = (code) => {
  if (!isValidReferralCodeFormat(code)) {
    return { valid: false, error: 'Invalid code format' };
  }
  
  const upperCode = code.toUpperCase();
  const codeType = upperCode.startsWith('USER') ? 'user' : 'scrapper';
  const codeMapKey = codeType === 'scrapper'
    ? 'scrapperReferralCodes'
    : 'userReferralCodes';
  
  const existingCodes = JSON.parse(localStorage.getItem(codeMapKey) || '{}');
  const codeData = existingCodes[upperCode];
  
  if (!codeData) {
    return { valid: false, error: 'Referral code not found' };
  }
  
  // Check if referrer is blocked (if user data exists)
  const userKey = codeType === 'scrapper' ? 'scrapperUser' : 'user';
  const userData = localStorage.getItem(userKey);
  if (userData) {
    const user = JSON.parse(userData);
    if (user.status === 'blocked') {
      return { valid: false, error: 'Referrer account is blocked' };
    }
  }
  
  return {
    valid: true,
    referrerId: codeData.userId,
    referrerType: codeType,
    code: upperCode
  };
};

/**
 * Create a referral relationship
 */
export const createReferral = (referrerCode, refereeId, refereeType) => {
  const validation = validateReferralCode(referrerCode);
  
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  // Prevent self-referral
  const refereeUserKey = refereeType === 'scrapper' ? 'scrapperUser' : 'user';
  const refereeUser = JSON.parse(localStorage.getItem(refereeUserKey) || '{}');
  if (refereeUser.phone === validation.referrerId) {
    return { success: false, error: 'Cannot refer yourself' };
  }
  
  // Check if this phone number was already referred
  const referralsKey = 'referrals';
  const allReferrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
  const existingReferral = allReferrals.find(
    ref => ref.refereeId === refereeId && ref.refereeType === refereeType
  );
  
  if (existingReferral) {
    return { success: false, error: 'This account was already referred' };
  }
  
  // Create referral record
  const referral = {
    id: `ref_${Date.now()}`,
    referrerCode: validation.code,
    referrerId: validation.referrerId,
    referrerType: validation.referrerType,
    refereeId,
    refereeType,
    status: 'active',
    createdAt: new Date().toISOString(),
    rewards: {
      referrerRewards: [],
      refereeRewards: []
    },
    milestones: {
      refereeRegistered: true,
      refereeFirstRequest: false,
      refereeFirstCompletion: false,
      refereeKYCVerified: false,
      refereeSubscribed: false,
      refereeFirstPickup: false
    }
  };
  
  allReferrals.push(referral);
  localStorage.setItem(referralsKey, JSON.stringify(allReferrals));
  
  // Update referrer's code stats
  const codeMapKey = validation.referrerType === 'scrapper'
    ? 'scrapperReferralCodes'
    : 'userReferralCodes';
  const codes = JSON.parse(localStorage.getItem(codeMapKey) || '{}');
  if (codes[validation.code]) {
    codes[validation.code].totalReferrals = (codes[validation.code].totalReferrals || 0) + 1;
    localStorage.setItem(codeMapKey, JSON.stringify(codes));
  }
  
  return { success: true, referral };
};

/**
 * Get referral settings (admin configurable)
 */
export const getReferralSettings = () => {
  const defaultSettings = {
    enabled: true,
    userRewards: {
      signupBonus: 50,      // Referrer gets ₹50 when referee signs up
      refereeWelcomeBonus: 100  // Referee gets ₹100 welcome bonus
    },
    scrapperRewards: {
      signupBonus: 100,     // Referrer gets ₹100 when referee signs up
      refereeWelcomeBonus: 200  // Referee gets ₹200 welcome bonus
    }
  };
  
  const stored = localStorage.getItem('referralSettings');
  return stored ? JSON.parse(stored) : defaultSettings;
};

/**
 * Update referral settings (admin only)
 */
export const updateReferralSettings = (settings) => {
  localStorage.setItem('referralSettings', JSON.stringify(settings));
};

/**
 * Process signup bonus rewards
 */
export const processSignupBonus = (referralId) => {
  const referralsKey = 'referrals';
  const allReferrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
  const referral = allReferrals.find(ref => ref.id === referralId);
  
  if (!referral) {
    return { success: false, error: 'Referral not found' };
  }
  
  const settings = getReferralSettings();
  
  if (!settings.enabled) {
    return { success: false, error: 'Referral system is disabled' };
  }
  
  // Get reward amounts based on referrer type
  const rewards = referral.referrerType === 'scrapper'
    ? settings.scrapperRewards
    : settings.userRewards;
  
  // Credit referrer reward
  const referrerReward = {
    type: 'signup_bonus',
    amount: rewards.signupBonus,
    status: 'credited',
    creditedAt: new Date().toISOString()
  };
  
  referral.rewards.referrerRewards.push(referrerReward);
  
  // Credit referee welcome bonus
  const refereeReward = {
    type: 'welcome_bonus',
    amount: rewards.refereeWelcomeBonus,
    status: 'credited',
    creditedAt: new Date().toISOString()
  };
  
  referral.rewards.refereeRewards.push(refereeReward);
  
  // Update wallet/earnings
  if (referral.referrerType === 'user') {
    // Credit to user wallet
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.walletBalance = (user.walletBalance || 0) + rewards.signupBonus;
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    // Credit to scrapper earnings
    const earnings = JSON.parse(localStorage.getItem('scrapperEarnings') || '{"total": 0}');
    earnings.total = (earnings.total || 0) + rewards.signupBonus;
    localStorage.setItem('scrapperEarnings', JSON.stringify(earnings));
  }
  
  // Credit referee welcome bonus
  if (referral.refereeType === 'user') {
    const refereeUser = JSON.parse(localStorage.getItem('user') || '{}');
    refereeUser.walletBalance = (refereeUser.walletBalance || 0) + rewards.refereeWelcomeBonus;
    localStorage.setItem('user', JSON.stringify(refereeUser));
  } else {
    const refereeEarnings = JSON.parse(localStorage.getItem('scrapperEarnings') || '{"total": 0}');
    refereeEarnings.total = (refereeEarnings.total || 0) + rewards.refereeWelcomeBonus;
    localStorage.setItem('scrapperEarnings', JSON.stringify(refereeEarnings));
  }
  
  // Save updated referral
  const index = allReferrals.findIndex(ref => ref.id === referralId);
  allReferrals[index] = referral;
  localStorage.setItem(referralsKey, JSON.stringify(allReferrals));
  
  // Update referrer code earnings
  const codeMapKey = referral.referrerType === 'scrapper'
    ? 'scrapperReferralCodes'
    : 'userReferralCodes';
  const codes = JSON.parse(localStorage.getItem(codeMapKey) || '{}');
  if (codes[referral.referrerCode]) {
    codes[referral.referrerCode].totalEarnings = 
      (codes[referral.referrerCode].totalEarnings || 0) + rewards.signupBonus;
    localStorage.setItem(codeMapKey, JSON.stringify(codes));
  }
  
  return { success: true, referral };
};

/**
 * Get user's referral statistics
 */
export const getUserReferralStats = (userId, userType = 'user') => {
  const referralsKey = 'referrals';
  const allReferrals = JSON.parse(localStorage.getItem(referralsKey) || '[]');
  
  const userReferrals = allReferrals.filter(
    ref => ref.referrerId === userId && ref.referrerType === userType
  );
  
  const totalReferrals = userReferrals.length;
  const totalEarnings = userReferrals.reduce((sum, ref) => {
    const referrerRewards = ref.rewards?.referrerRewards || [];
    return sum + referrerRewards.reduce((s, r) => s + (r.amount || 0), 0);
  }, 0);
  
  const code = userType === 'scrapper'
    ? localStorage.getItem('scrapperReferralCode')
    : localStorage.getItem('userReferralCode');
  
  return {
    code: code || getOrGenerateReferralCode(userId, userType),
    totalReferrals,
    totalEarnings,
    referrals: userReferrals
  };
};

/**
 * Get all referrals (for admin)
 */
export const getAllReferrals = () => {
  const referralsKey = 'referrals';
  return JSON.parse(localStorage.getItem(referralsKey) || '[]');
};

/**
 * Get referral by ID
 */
export const getReferralById = (referralId) => {
  const allReferrals = getAllReferrals();
  return allReferrals.find(ref => ref.id === referralId);
};

