# Referral System Analysis & Design Document
## ScrapConnect - Scrap Pickup Platform

---

## 📋 Executive Summary

This document outlines a comprehensive referral system for ScrapConnect that allows both **Users** and **Scrappers** to refer new members and earn rewards. The system is designed to drive organic growth, increase user acquisition, and incentivize both sides of the marketplace.

---

## 🎯 Business Objectives

1. **User Acquisition**: Increase organic user base through word-of-mouth marketing
2. **User Retention**: Reward existing users for bringing in new members
3. **Scrapper Network Growth**: Expand scrapper network to serve more areas
4. **Platform Engagement**: Increase transaction volume through referrals
5. **Cost-Effective Marketing**: Reduce customer acquisition cost (CAC)

---

## 👥 Target Audiences for Referrals

### 1. **User-to-User Referrals**
- **Who can refer**: Existing verified users
- **Who can be referred**: New users signing up
- **Incentive**: Both referrer and referee get rewards

### 2. **Scrapper-to-Scrapper Referrals**
- **Who can refer**: Active scrappers (KYC verified + subscribed)
- **Who can be referred**: New scrappers joining the platform
- **Incentive**: Referrer gets commission, referee gets welcome bonus

### 3. **Cross-Referral (Optional)**
- **User referring Scrapper**: User gets bonus when their referred scrapper completes first pickup
- **Scrapper referring User**: Scrapper gets bonus when referred user creates first request

---

## 💰 Reward Structure

### **User Referral Rewards**

#### **For Referrer (Existing User)**
1. **Sign-up Bonus**: ₹50 credited to wallet when referred user completes registration
2. **First Request Bonus**: ₹100 credited when referred user creates their first pickup request
3. **First Completion Bonus**: ₹150 credited when referred user's first request is completed
4. **Total Potential**: ₹300 per successful referral

#### **For Referee (New User)**
1. **Welcome Bonus**: ₹100 credited to wallet upon successful registration via referral
2. **First Request Bonus**: Additional ₹50 when they create first request
3. **Total Potential**: ₹150 welcome benefits

### **Scrapper Referral Rewards**

#### **For Referrer (Existing Scrapper)**
1. **Sign-up Bonus**: ₹100 credited when referred scrapper completes registration
2. **KYC Verification Bonus**: ₹200 credited when referred scrapper's KYC is verified
3. **Subscription Bonus**: ₹300 credited when referred scrapper subscribes to any plan
4. **First Pickup Bonus**: ₹200 credited when referred scrapper completes first pickup
5. **Total Potential**: ₹800 per successful referral

#### **For Referee (New Scrapper)**
1. **Welcome Bonus**: ₹200 credited to earnings when they complete registration via referral
2. **KYC Completion Bonus**: ₹100 credited when KYC is verified
3. **First Subscription Discount**: 20% off first month subscription (₹99 → ₹79 or ₹199 → ₹159)
4. **Total Potential**: ₹300 + subscription discount

### **Tiered Referral System (Advanced)**

#### **User Referral Tiers**
- **Bronze (1-5 referrals)**: Standard rewards (₹300 per referral)
- **Silver (6-15 referrals)**: 10% bonus on all rewards (₹330 per referral)
- **Gold (16-30 referrals)**: 20% bonus on all rewards (₹360 per referral)
- **Platinum (31+ referrals)**: 30% bonus + ₹500 monthly bonus (₹390 per referral + ₹500/month)

#### **Scrapper Referral Tiers**
- **Bronze (1-3 referrals)**: Standard rewards (₹800 per referral)
- **Silver (4-10 referrals)**: 15% bonus on all rewards (₹920 per referral)
- **Gold (11-20 referrals)**: 25% bonus on all rewards (₹1000 per referral)
- **Platinum (21+ referrals)**: 35% bonus + ₹1000 monthly bonus (₹1080 per referral + ₹1000/month)

---

## 🔗 Referral Code System

### **Code Generation**
- **Format**: 
  - Users: `USER-XXXXXX` (6 alphanumeric characters)
  - Scrappers: `SCRAP-XXXXXX` (6 alphanumeric characters)
- **Uniqueness**: Each user/scrapper gets one unique code (never changes)
- **Display**: 
  - Profile page
  - Shareable link: `scrapconnect.com/ref/USER-XXXXXX`
  - QR code for easy sharing

### **Code Validation**
- **During Signup**: Optional referral code field
- **Validation**: 
  - Check if code exists
  - Check if code belongs to same user type (user code for user signup, scrapper code for scrapper signup)
  - Check if referrer is active (not blocked)
  - Prevent self-referral
- **Expiry**: Codes never expire (unless user is blocked)

---

## 📱 User Experience Flow

### **User Referral Flow**

#### **Step 1: Referrer Shares Code**
1. User opens "My Profile" → "Refer & Earn" section
2. Sees their unique referral code and shareable link
3. Options to share:
   - Copy link
   - Share via WhatsApp
   - Share via SMS
   - Share via Email
   - Generate QR code
   - Share on social media

#### **Step 2: Referee Signs Up**
1. New user clicks referral link or enters code during signup
2. Signup form shows: "You were referred by [Referrer Name]"
3. After OTP verification, referral is linked
4. Welcome bonus (₹100) credited immediately

#### **Step 3: Rewards Unlock**
1. **Referrer**: Gets ₹50 when referee registers
2. **Referee**: Gets ₹100 welcome bonus
3. **Referrer**: Gets ₹100 when referee creates first request
4. **Referee**: Gets ₹50 bonus on first request
5. **Referrer**: Gets ₹150 when referee's first request completes
6. **Referee**: Normal payment for scrap

### **Scrapper Referral Flow**

#### **Step 1: Referrer Shares Code**
1. Scrapper opens dashboard → "Refer & Earn" section
2. Sees referral code, link, and earnings from referrals
3. Share options similar to user flow

#### **Step 2: Referee Signs Up**
1. New scrapper enters referral code during registration
2. After OTP verification, referral is linked
3. Welcome bonus (₹200) credited to earnings

#### **Step 3: Rewards Unlock**
1. **Referrer**: Gets ₹100 when referee registers
2. **Referee**: Gets ₹200 welcome bonus
3. **Referrer**: Gets ₹200 when referee's KYC is verified
4. **Referee**: Gets ₹100 bonus when KYC verified
5. **Referrer**: Gets ₹300 when referee subscribes
6. **Referee**: Gets 20% discount on first subscription
7. **Referrer**: Gets ₹200 when referee completes first pickup
8. **Referee**: Normal earnings from pickup

---

## 🗄️ Database Schema

### **Referrals Collection**
```json
{
  "_id": "ObjectId",
  "referrerId": "user_123 / scrapper_456",
  "referrerType": "user / scrapper",
  "refereeId": "user_789 / scrapper_012",
  "refereeType": "user / scrapper",
  "referralCode": "USER-ABC123",
  "status": "pending / active / completed / expired",
  "createdAt": "2024-01-15T10:30:00Z",
  "rewards": {
    "referrerRewards": [
      {
        "type": "signup_bonus",
        "amount": 50,
        "status": "credited / pending",
        "creditedAt": "2024-01-15T10:35:00Z"
      },
      {
        "type": "first_request_bonus",
        "amount": 100,
        "status": "pending",
        "creditedAt": null
      },
      {
        "type": "first_completion_bonus",
        "amount": 150,
        "status": "pending",
        "creditedAt": null
      }
    ],
    "refereeRewards": [
      {
        "type": "welcome_bonus",
        "amount": 100,
        "status": "credited",
        "creditedAt": "2024-01-15T10:35:00Z"
      }
    ]
  },
  "milestones": {
    "refereeRegistered": true,
    "refereeFirstRequest": false,
    "refereeFirstCompletion": false,
    "refereeKYCVerified": false,
    "refereeSubscribed": false,
    "refereeFirstPickup": false
  }
}
```

### **Referral Codes Collection**
```json
{
  "_id": "ObjectId",
  "userId": "user_123 / scrapper_456",
  "userType": "user / scrapper",
  "code": "USER-ABC123",
  "isActive": true,
  "totalReferrals": 5,
  "totalEarnings": 1500,
  "createdAt": "2024-01-01T00:00:00Z",
  "tier": "bronze / silver / gold / platinum"
}
```

### **Referral Transactions Collection**
```json
{
  "_id": "ObjectId",
  "referralId": "ref_123",
  "userId": "user_123",
  "userType": "user / scrapper",
  "transactionType": "referral_reward",
  "amount": 50,
  "rewardType": "signup_bonus / first_request_bonus / etc",
  "status": "credited / pending / failed",
  "creditedAt": "2024-01-15T10:35:00Z",
  "walletBalanceAfter": 150,
  "description": "Referral signup bonus for USER-ABC123"
}
```

---

## 🎨 UI/UX Components Needed

### **1. Refer & Earn Page (User)**
- **Location**: My Profile → Refer & Earn tab
- **Components**:
  - Referral code display (large, copyable)
  - Shareable link
  - QR code generator
  - Share buttons (WhatsApp, SMS, Email, Social)
  - Referral stats:
    - Total referrals
    - Successful referrals
    - Total earnings from referrals
    - Pending rewards
  - Referral list (who you referred, their status, rewards earned)
  - Tier badge (Bronze/Silver/Gold/Platinum)
  - Progress bar to next tier

### **2. Refer & Earn Page (Scrapper)**
- **Location**: Dashboard → Refer & Earn section
- **Components**: Similar to user page but with scrapper-specific rewards

### **3. Referral Code Input (Signup)**
- **Location**: Login/Signup page
- **Components**:
  - Optional referral code input field
  - "Have a referral code?" toggle
  - Code validation feedback
  - Referrer name display (if valid code)

### **4. Referral Notification**
- **Location**: Notifications/In-app
- **Components**:
  - "You earned ₹50 for referral signup!"
  - "Your referral created their first request - ₹100 bonus!"
  - "Congratulations! You reached Silver tier!"

### **5. Admin Referral Dashboard**
- **Location**: Admin Panel → Referrals section
- **Components**:
  - Total referrals stats
  - Top referrers (users & scrappers)
  - Referral conversion rates
  - Reward payouts summary
  - Fraud detection alerts
  - Referral analytics

---

## 🔒 Fraud Prevention & Validation

### **Validation Rules**
1. **Self-Referral Prevention**: User cannot use their own code
2. **Duplicate Prevention**: Same phone number cannot be referred twice
3. **Device/IP Check**: Flag suspicious patterns (same device/IP, multiple signups)
4. **Activity Verification**: 
   - User referral: Referee must create at least one request
   - Scrapper referral: Referee must complete KYC + subscription
5. **Time-Based Validation**: Minimum 24 hours between signup and first request (prevents fake accounts)
6. **Phone Verification**: OTP verification mandatory (already in place)
7. **KYC Verification**: For scrapper referrals, KYC must be verified

### **Fraud Detection**
- Multiple signups from same device/IP
- Rapid-fire referrals (suspicious pattern)
- Referrals that never complete any action
- Blocked users trying to refer
- Admin review queue for flagged referrals

---

## 📊 Analytics & Tracking

### **Key Metrics to Track**
1. **Referral Rate**: % of new signups using referral codes
2. **Conversion Rate**: % of referrals that complete first action
3. **Referral Quality**: % of referrals that become active users
4. **Cost per Acquisition (CPA)**: Total referral rewards / new users acquired
5. **Lifetime Value (LTV)**: Average value of referred users vs non-referred
6. **Referral Velocity**: Average time from referral to first action
7. **Tier Distribution**: % of referrers in each tier
8. **Top Referrers**: Users/scrappers with most successful referrals

### **Dashboard Metrics**
- Total referrals (today, week, month)
- Active referral codes
- Total rewards paid
- Referral conversion funnel
- Geographic distribution of referrals

---

## 🚀 Implementation Phases (Detailed Breakdown)

### **Phase 1: Core Referral System Foundation (Weeks 1-3)**

#### **1.1 Database & Backend Setup (Week 1)**
- Create referral collections (referrals, referralCodes, referralTransactions)
- Backend APIs for referral code generation
- Referral code validation API
- Basic referral linking during signup
- Admin API for referral management

#### **1.2 Frontend - User Signup Integration (Week 1-2)**
- Add referral code input field in user signup
- Add referral code input field in scrapper signup
- Referral code validation UI
- Show referrer name when valid code entered
- Link referral during registration

#### **1.3 Basic Reward System (Week 2)**
- Simple signup bonus (configurable by admin)
- Wallet/earnings credit on signup
- Basic referral tracking
- Transaction logging

#### **1.4 User Referral Page (Week 2-3)**
- "Refer & Earn" section in user profile
- Display unique referral code
- Copy code functionality
- Shareable link generation
- Basic referral stats (total referrals, total earnings)

#### **1.5 Admin - Referral Management (Week 3)**
- Admin panel: Referral Settings page
- Configure default reward amounts
- View all referrals
- Manual reward adjustment
- Basic referral analytics

**Deliverables:**
- ✅ Users can share referral codes
- ✅ New users can sign up with referral codes
- ✅ Basic signup bonus credited
- ✅ Admin can view and manage referrals

---

### **Phase 2: Multi-Milestone Rewards & Tracking (Weeks 4-6)**

#### **2.1 Milestone Reward System (Week 4)**
- Backend: Milestone tracking system
- Reward triggers for:
  - User: First request, First completion
  - Scrapper: KYC verification, Subscription, First pickup
- Automatic reward processing
- Reward status tracking

#### **2.2 Enhanced Referral Tracking (Week 4-5)**
- Detailed referral status tracking
- Milestone completion tracking
- Reward history per referral
- Referral lifecycle management

#### **2.3 Notification System (Week 5)**
- Push notifications for rewards earned
- In-app notifications for milestone completions
- Email/SMS notifications (optional)
- Notification preferences

#### **2.4 Enhanced User Referral Dashboard (Week 5-6)**
- Referral list with status
- Individual referral details
- Reward breakdown per referral
- Pending vs credited rewards
- Referral timeline/activity log

#### **2.5 Scrapper Referral Dashboard (Week 6)**
- Similar to user dashboard
- Scrapper-specific rewards display
- Earnings from referrals section

#### **2.6 Admin - Advanced Management (Week 6)**
- Admin: Configure milestone rewards
- Admin: Set reward amounts per milestone
- Admin: Enable/disable specific rewards
- Admin: Bulk reward processing
- Admin: Referral analytics dashboard

**Deliverables:**
- ✅ Multi-milestone rewards working
- ✅ Automatic reward processing
- ✅ Notifications for rewards
- ✅ Detailed referral tracking
- ✅ Admin can configure all reward amounts

---

### **Phase 3: Tiered System & Sharing Features (Weeks 7-9)**

#### **3.1 Tiered Referral System (Week 7)**
- Backend: Tier calculation logic
- Tier assignment (Bronze/Silver/Gold/Platinum)
- Tier-based bonus calculation
- Monthly tier bonuses
- Tier upgrade notifications

#### **3.2 QR Code Generation (Week 7-8)**
- QR code generation for referral links
- QR code display in referral page
- Download/share QR code
- QR code scanning (if app has scanner)

#### **3.3 Social Sharing Integration (Week 8)**
- WhatsApp sharing
- SMS sharing
- Email sharing
- Social media sharing (Facebook, Twitter, Instagram)
- Custom share messages
- Share analytics tracking

#### **3.4 Referral Leaderboard (Week 8-9)**
- Top referrers list (users)
- Top referrers list (scrappers)
- Monthly leaderboard
- All-time leaderboard
- Leaderboard rewards (optional)

#### **3.5 Enhanced Admin Features (Week 9)**
- Admin: Configure tier thresholds
- Admin: Set tier bonus percentages
- Admin: Configure monthly tier bonuses
- Admin: Manage leaderboard settings
- Admin: Referral campaign management

**Deliverables:**
- ✅ Tiered system working
- ✅ QR codes for easy sharing
- ✅ Social sharing integrated
- ✅ Leaderboards functional
- ✅ Admin can configure tiers and bonuses

---

### **Phase 4: Advanced Features & Cross-Referrals (Weeks 10-12)**

#### **4.1 Cross-Referral System (Week 10)**
- User referring Scrapper functionality
- Scrapper referring User functionality
- Cross-referral reward structure
- Cross-referral tracking

#### **4.2 Advanced Analytics (Week 10-11)**
- Referral conversion funnel
- Referral quality metrics
- Geographic distribution
- Time-based analytics
- Cohort analysis

#### **4.3 Fraud Detection System (Week 11)**
- Device/IP tracking
- Pattern detection
- Suspicious activity alerts
- Auto-flagging system
- Admin review queue

#### **4.4 Referral Contests & Campaigns (Week 11-12)**
- Campaign creation system
- Contest management
- Limited-time promotions
- Custom reward structures per campaign
- Campaign analytics

#### **4.5 Admin - Full Control Panel (Week 12)**
- Admin: Create/edit/delete campaigns
- Admin: Set custom reward structures
- Admin: Fraud detection dashboard
- Admin: Bulk operations
- Admin: Export referral data
- Admin: Referral system on/off toggle

**Deliverables:**
- ✅ Cross-referrals working
- ✅ Advanced analytics dashboard
- ✅ Fraud detection active
- ✅ Campaign system functional
- ✅ Admin has full control

---

### **Phase 5: Optimization & Polish (Weeks 13-14)**

#### **5.1 Performance Optimization (Week 13)**
- Database query optimization
- Caching for referral stats
- API response time optimization
- Frontend performance improvements

#### **5.2 A/B Testing Framework (Week 13)**
- A/B test different reward amounts
- A/B test referral messaging
- Conversion tracking
- Results dashboard

#### **5.3 User Experience Polish (Week 14)**
- UI/UX improvements
- Animation enhancements
- Mobile responsiveness
- Accessibility improvements
- Error handling & edge cases

#### **5.4 Documentation & Training (Week 14)**
- Admin user guide
- API documentation
- User help documentation
- Video tutorials

**Deliverables:**
- ✅ Optimized performance
- ✅ A/B testing ready
- ✅ Polished UX
- ✅ Complete documentation

---

## 🎛️ Admin Control Panel - Full Dynamic Management

### **Admin Referral Management Features**

#### **1. Referral Settings Dashboard**
- **Location**: Admin Panel → Referrals → Settings
- **Features**:
  - Enable/Disable referral system (global toggle)
  - Set default reward amounts for all milestones
  - Configure reward currency
  - Set minimum wallet balance for withdrawals
  - Configure reward expiry (if applicable)

#### **2. User Referral Rewards Management**
- **Location**: Admin Panel → Referrals → User Rewards
- **Features**:
  - **Create Reward**: Add new reward milestone
    - Reward name (e.g., "First Request Bonus")
    - Reward amount (₹)
    - Trigger condition (signup, first_request, first_completion)
    - Status (active/inactive)
  - **Edit Reward**: Modify existing reward amounts
  - **Delete Reward**: Remove reward milestones
  - **Enable/Disable**: Toggle individual rewards
  - **Bulk Edit**: Update multiple rewards at once

#### **3. Scrapper Referral Rewards Management**
- **Location**: Admin Panel → Referrals → Scrapper Rewards
- **Features**: Similar to User Rewards
  - Create/Edit/Delete scrapper-specific rewards
  - Configure KYC bonus, subscription bonus, pickup bonus
  - Set different amounts for different plans

#### **4. Tier System Management**
- **Location**: Admin Panel → Referrals → Tiers
- **Features**:
  - **Create Tier**: 
    - Tier name (Bronze/Silver/Gold/Platinum)
    - Minimum referrals required
    - Bonus percentage
    - Monthly bonus amount
    - Tier badge/icon
  - **Edit Tier**: Modify thresholds and bonuses
  - **Delete Tier**: Remove tier levels
  - **Reorder Tiers**: Change tier hierarchy
  - **Tier Preview**: See how rewards calculate at each tier

#### **5. Referral Code Management**
- **Location**: Admin Panel → Referrals → Codes
- **Features**:
  - View all referral codes
  - Search by user/scrapper
  - View code statistics
  - **Generate Custom Code**: Create special codes (e.g., "WELCOME2024")
  - **Deactivate Code**: Disable specific codes
  - **Reset Code**: Generate new code for user
  - **Bulk Operations**: Deactivate multiple codes

#### **6. Referral Campaign Management**
- **Location**: Admin Panel → Referrals → Campaigns
- **Features**:
  - **Create Campaign**:
    - Campaign name
    - Start/End dates
    - Target audience (users/scrappers/both)
    - Custom reward structure
    - Campaign description
    - Promotional banner
  - **Edit Campaign**: Modify active campaigns
  - **Delete Campaign**: Remove campaigns
  - **Duplicate Campaign**: Clone existing campaign
  - **Campaign Analytics**: View performance metrics

#### **7. Referral Analytics Dashboard**
- **Location**: Admin Panel → Referrals → Analytics
- **Features**:
  - Total referrals (today, week, month, all-time)
  - Referral conversion rates
  - Reward payout summary
  - Top referrers list
  - Geographic distribution
  - Referral quality metrics
  - Cost per acquisition (CPA)
  - Export analytics data (CSV/PDF)

#### **8. Referral Transactions Management**
- **Location**: Admin Panel → Referrals → Transactions
- **Features**:
  - View all referral transactions
  - Filter by user, date, reward type, status
  - **Manual Credit**: Manually credit rewards
  - **Reverse Transaction**: Refund/remove rewards
  - **Bulk Process**: Process pending rewards
  - Transaction export

#### **9. Fraud Detection & Review**
- **Location**: Admin Panel → Referrals → Fraud Detection
- **Features**:
  - Flagged referrals list
  - Suspicious activity alerts
  - **Review & Approve**: Approve flagged referrals
  - **Reject**: Reject fraudulent referrals
  - **Block User**: Block user from referrals
  - Fraud detection settings:
    - Enable/disable auto-flagging
    - Set flagging thresholds
    - Configure detection rules

#### **10. Referral Rules & Validation**
- **Location**: Admin Panel → Referrals → Rules
- **Features**:
  - **Create Rule**:
    - Rule name
    - Rule type (validation, reward, restriction)
    - Conditions (if/then logic)
    - Actions (allow, block, flag, modify reward)
  - **Edit Rule**: Modify existing rules
  - **Delete Rule**: Remove rules
  - **Rule Priority**: Set execution order
  - **Test Rule**: Test rule logic

#### **11. Referral Templates & Messaging**
- **Location**: Admin Panel → Referrals → Templates
- **Features**:
  - **Create Template**: 
    - Template name
    - Message type (WhatsApp, SMS, Email)
    - Message content (with variables)
    - Preview template
  - **Edit Template**: Modify messaging
  - **Delete Template**: Remove templates
  - **Set Default**: Set default share messages
  - Variables available: {referrerName}, {code}, {link}, {bonus}

#### **12. Referral Leaderboard Management**
- **Location**: Admin Panel → Referrals → Leaderboard
- **Features**:
  - Configure leaderboard settings
  - Set leaderboard period (daily, weekly, monthly, all-time)
  - Set leaderboard size (top 10, 20, 50, 100)
  - Enable/disable leaderboard rewards
  - Set leaderboard reward amounts
  - Reset leaderboard

#### **13. Bulk Operations**
- **Location**: Admin Panel → Referrals → Bulk Operations
- **Features**:
  - **Bulk Reward Credit**: Credit rewards to multiple users
  - **Bulk Code Generation**: Generate codes for multiple users
  - **Bulk Status Update**: Update referral statuses
  - **Bulk Deactivate**: Deactivate multiple codes
  - **Import/Export**: Import referral data, export for analysis

#### **14. Referral System Logs**
- **Location**: Admin Panel → Referrals → Logs
- **Features**:
  - View all referral system actions
  - Filter by action type, user, date
  - Admin action history
  - System error logs
  - Audit trail for compliance

---

## 🔧 Admin API Endpoints Needed

### **Referral Settings**
- `GET /api/admin/referrals/settings` - Get all settings
- `PUT /api/admin/referrals/settings` - Update settings
- `POST /api/admin/referrals/settings/toggle` - Enable/disable system

### **Reward Management**
- `GET /api/admin/referrals/rewards` - Get all rewards
- `POST /api/admin/referrals/rewards` - Create reward
- `PUT /api/admin/referrals/rewards/:id` - Update reward
- `DELETE /api/admin/referrals/rewards/:id` - Delete reward
- `PUT /api/admin/referrals/rewards/:id/toggle` - Enable/disable reward

### **Tier Management**
- `GET /api/admin/referrals/tiers` - Get all tiers
- `POST /api/admin/referrals/tiers` - Create tier
- `PUT /api/admin/referrals/tiers/:id` - Update tier
- `DELETE /api/admin/referrals/tiers/:id` - Delete tier
- `PUT /api/admin/referrals/tiers/reorder` - Reorder tiers

### **Campaign Management**
- `GET /api/admin/referrals/campaigns` - Get all campaigns
- `POST /api/admin/referrals/campaigns` - Create campaign
- `PUT /api/admin/referrals/campaigns/:id` - Update campaign
- `DELETE /api/admin/referrals/campaigns/:id` - Delete campaign
- `PUT /api/admin/referrals/campaigns/:id/status` - Activate/deactivate

### **Code Management**
- `GET /api/admin/referrals/codes` - Get all codes
- `POST /api/admin/referrals/codes/generate` - Generate custom code
- `PUT /api/admin/referrals/codes/:id/deactivate` - Deactivate code
- `POST /api/admin/referrals/codes/reset` - Reset user's code

### **Transaction Management**
- `GET /api/admin/referrals/transactions` - Get all transactions
- `POST /api/admin/referrals/transactions/credit` - Manual credit
- `POST /api/admin/referrals/transactions/reverse` - Reverse transaction
- `POST /api/admin/referrals/transactions/bulk-process` - Bulk process

### **Fraud Management**
- `GET /api/admin/referrals/fraud/flagged` - Get flagged referrals
- `POST /api/admin/referrals/fraud/approve/:id` - Approve referral
- `POST /api/admin/referrals/fraud/reject/:id` - Reject referral
- `PUT /api/admin/referrals/fraud/settings` - Update fraud settings

### **Analytics**
- `GET /api/admin/referrals/analytics/overview` - Overview stats
- `GET /api/admin/referrals/analytics/conversion` - Conversion metrics
- `GET /api/admin/referrals/analytics/top-referrers` - Top referrers
- `GET /api/admin/referrals/analytics/export` - Export data

---

## 📋 Admin UI Components Needed

### **1. Referral Settings Page**
- Global toggle switch
- Settings form (reward amounts, currency, etc.)
- Save/Cancel buttons

### **2. Reward Management Page**
- Rewards list (table)
- Create/Edit/Delete buttons
- Toggle switches for each reward
- Bulk actions

### **3. Tier Management Page**
- Tiers list (drag-and-drop reorder)
- Create/Edit/Delete tier modals
- Tier preview calculator
- Visual tier hierarchy

### **4. Campaign Management Page**
- Campaigns list (cards/table)
- Create campaign form (multi-step)
- Campaign calendar view
- Campaign analytics cards

### **5. Referral Codes Page**
- Codes table with search/filter
- Generate custom code modal
- Code actions (deactivate, reset)
- Code statistics cards

### **6. Transactions Page**
- Transactions table
- Filters (date, user, type, status)
- Manual credit modal
- Bulk process button
- Export button

### **7. Fraud Detection Page**
- Flagged referrals list
- Review modal (approve/reject)
- Fraud settings form
- Fraud statistics

### **8. Analytics Dashboard**
- KPI cards (total referrals, conversion rate, etc.)
- Charts (line, bar, pie)
- Top referrers table
- Date range selector
- Export options

### **9. Rules Management Page**
- Rules list
- Rule builder (visual/form-based)
- Test rule functionality
- Rule priority manager

### **10. Templates Page**
- Templates list
- Template editor (rich text)
- Variable picker
- Preview panel

---

## ✅ Phase-wise Deliverables Checklist

### **Phase 1 Checklist**
- [ ] Database collections created
- [ ] Backend APIs for code generation & validation
- [ ] Referral code input in signup forms
- [ ] Basic signup bonus credited
- [ ] User referral page with code display
- [ ] Admin referral settings page
- [ ] Admin can view all referrals
- [ ] Admin can configure default rewards

### **Phase 2 Checklist**
- [ ] Milestone tracking system
- [ ] Automatic reward processing
- [ ] Notification system for rewards
- [ ] Enhanced referral dashboard (user & scrapper)
- [ ] Admin can configure milestone rewards
- [ ] Admin can enable/disable rewards
- [ ] Referral transaction logging

### **Phase 3 Checklist**
- [ ] Tier system implemented
- [ ] QR code generation
- [ ] Social sharing integration
- [ ] Referral leaderboard
- [ ] Admin tier management
- [ ] Admin can configure tier thresholds
- [ ] Admin can set tier bonuses

### **Phase 4 Checklist**
- [ ] Cross-referral system
- [ ] Advanced analytics dashboard
- [ ] Fraud detection system
- [ ] Campaign management system
- [ ] Admin full control panel
- [ ] Admin can create/edit campaigns
- [ ] Admin fraud review queue

### **Phase 5 Checklist**
- [ ] Performance optimization
- [ ] A/B testing framework
- [ ] UX polish
- [ ] Complete documentation
- [ ] Admin training materials

---

## 💡 Additional Features (Future)

### **1. Referral Contests**
- Monthly contests: "Top 10 referrers get extra bonus"
- Seasonal campaigns: "Refer 5 friends, get ₹500 bonus"
- Limited-time promotions

### **2. Referral Groups/Teams**
- Form referral teams
- Team-based rewards
- Leaderboards

### **3. Referral Marketplace**
- Users can "gift" referral bonuses to others
- Referral code trading (if allowed)

### **4. Corporate Referrals**
- Bulk referral codes for businesses
- Custom reward structures

---

## 🎯 Success Metrics

### **Short-term (3 months)**
- 20% of new signups via referrals
- Average 2 referrals per active user
- ₹50,000 in referral rewards paid
- 500+ active referral codes

### **Long-term (12 months)**
- 40% of new signups via referrals
- Average 5 referrals per active user
- ₹5,00,000 in referral rewards paid
- 5000+ active referral codes
- 30% reduction in marketing CAC

---

## ⚠️ Considerations & Risks

### **Risks**
1. **Fraud**: Fake accounts, self-referrals, gaming the system
2. **Cost**: High referral rewards can impact profitability
3. **Quality**: Referred users might be less engaged
4. **Complexity**: Complex reward structure might confuse users

### **Mitigation**
1. Strong fraud detection and validation
2. Phased reward structure (not all at once)
3. Quality checks (referrals must complete actions)
4. Simple, clear UI/UX
5. Regular monitoring and adjustments

---

## 📝 Technical Requirements

### **Backend APIs Needed**
1. `POST /api/referrals/generate-code` - Generate referral code
2. `GET /api/referrals/my-code` - Get user's referral code
3. `POST /api/referrals/validate` - Validate referral code
4. `POST /api/referrals/apply` - Apply referral code during signup
5. `GET /api/referrals/stats` - Get referral statistics
6. `GET /api/referrals/list` - Get list of referrals
7. `POST /api/referrals/process-reward` - Process milestone rewards
8. `GET /api/admin/referrals` - Admin referral dashboard data

### **Frontend Components Needed**
1. ReferralCodeInput component
2. ReferralDashboard component
3. ReferralStats component
4. ReferralList component
5. ShareReferral component
6. QRCodeGenerator component
7. ReferralNotification component

### **Database Indexes**
- `referrals.referrerId`
- `referrals.refereeId`
- `referrals.referralCode`
- `referralCodes.code` (unique)
- `referralCodes.userId`

---

## 🎨 Design Recommendations

### **Color Scheme**
- Use existing brand colors (#64946e for primary)
- Success green for earned rewards
- Gold/Platinum colors for tier badges

### **Icons**
- Share icon for sharing
- Gift icon for rewards
- Trophy icon for tiers
- Users icon for referrals
- Rupee icon for earnings

### **Animations**
- Confetti animation when reward is credited
- Progress bar animation for tier progress
- Smooth transitions for referral list
- Pulse animation for new rewards

---

## ✅ Next Steps

1. **Review & Approval**: Get stakeholder approval on reward structure
2. **Database Design**: Finalize schema and create migrations
3. **API Development**: Build backend referral APIs
4. **UI/UX Design**: Create mockups for referral pages
5. **Frontend Development**: Build referral components
6. **Testing**: Test referral flows end-to-end
7. **Launch**: Soft launch with limited users
8. **Monitor & Optimize**: Track metrics and adjust

---

## 📞 Questions to Consider

1. Should referral rewards have an expiry date?
2. Should there be a maximum number of referrals per user?
3. Should referral rewards be taxable income?
4. Should we allow referral code changes?
5. Should we have referral code expiration?
6. What's the minimum wallet balance to withdraw referral earnings?
7. Should referral rewards be withdrawable immediately or after certain conditions?

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Prepared For**: ScrapConnect Development Team

