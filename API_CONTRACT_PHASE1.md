# API Contract Document - Phase 1
## Complete Backend API Mapping for Scrapper & Admin Panel

**Last Updated:** Phase 1 Implementation  
**Base URL:** `http://localhost:7000/api`

---

## 📋 Table of Contents
1. [Auth APIs](#auth-apis)
2. [Order APIs (User)](#order-apis-user)
3. [Order APIs (Scrapper)](#order-apis-scrapper)
4. [Order APIs (Admin)](#order-apis-admin)
5. [KYC APIs](#kyc-apis)
6. [Subscription APIs](#subscription-apis)
7. [Payment APIs](#payment-apis)
8. [Admin Management APIs](#admin-management-apis)
9. [Earnings APIs (To Be Added)](#earnings-apis-to-be-added)
10. [Screen-to-Endpoint Mapping](#screen-to-endpoint-mapping)

---

## 🔐 Auth APIs

### User/Scrapper Authentication
| Method | Endpoint | Role | Description | Frontend Usage |
|--------|----------|------|-------------|----------------|
| `POST` | `/auth/login-otp` | Public | Send OTP to phone | `ScrapperLogin.jsx`, `LoginSignup.jsx` |
| `POST` | `/auth/verify-otp` | Public | Verify OTP and login | `ScrapperLogin.jsx`, `LoginSignup.jsx` |
| `POST` | `/auth/register` | Public | Register new user/scrapper | `ScrapperLogin.jsx` |
| `POST` | `/auth/resend-otp` | Public | Resend OTP | `ScrapperLogin.jsx` |
| `GET` | `/auth/me` | Private | Get current user/scrapper | `ScrapperModule/index.jsx`, `ScrapperDashboard.jsx` |
| `PUT` | `/auth/profile` | Private | Update profile | Profile pages |

**Current Implementation:** ✅ Fully connected

---

## 📦 Order APIs (User)

### User Order Management
| Method | Endpoint | Role | Description | Frontend Usage |
|--------|----------|------|-------------|----------------|
| `POST` | `/orders` | User | Create new pickup request | `PriceConfirmationPage.jsx` |
| `GET` | `/orders/my-orders?status=&page=&limit=` | User | Get user's orders (paginated) | `MyRequestsPage.jsx` |
| `GET` | `/orders/:id` | User/Scrapper | Get order details | `RequestStatusPage.jsx`, `ActiveRequestDetailsPage.jsx` |
| `PUT` | `/orders/:id` | User | Update pending order | (Future) |
| `PUT` | `/orders/:id/status` | User/Scrapper | Update order status | `ActiveRequestDetailsPage.jsx` |
| `POST` | `/orders/:id/cancel` | User | Cancel order | `MyRequestsPage.jsx` |

**Current Implementation:** ✅ Fully connected

---

## 🚚 Order APIs (Scrapper)

### Scrapper Order Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/orders/available` | Scrapper | Get available (unassigned) orders | `ActiveRequestsPage.jsx` | ✅ Backend exists |
| `GET` | `/orders/my-assigned?status=` | Scrapper | Get scrapper's assigned orders | `MyActiveRequestsPage.jsx` | ✅ Backend exists |
| `POST` | `/orders/:id/accept` | Scrapper | Accept an order | `ActiveRequestsPage.jsx` | ✅ Backend exists |
| `PUT` | `/orders/:id/status` | Scrapper | Update order status (on_the_way, picked_up, etc.) | `ActiveRequestDetailsPage.jsx` | ✅ Backend exists |
| `GET` | `/orders/:id` | Scrapper | Get order details | `ActiveRequestDetailsPage.jsx` | ✅ Backend exists |

**Current Implementation:** ⚠️ **Backend exists but frontend using localStorage**  
**Action Required:** Replace `scrapperRequestUtils.js` localStorage calls with these APIs

---

## 👨‍💼 Order APIs (Admin)

### Admin Order Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/admin/orders?status=&page=&limit=` | Admin | Get all orders (with filters) | `ActiveRequests.jsx` | ✅ Backend exists |
| `GET` | `/admin/orders/:id` | Admin | Get order details | (Future detail page) | ✅ Backend exists |
| `PUT` | `/admin/orders/:id` | Admin | Update order | (Future) | ✅ Backend exists |
| `POST` | `/admin/orders/:id/assign` | Admin | Assign order to scrapper | `ActiveRequests.jsx` | ✅ Backend exists |
| `POST` | `/admin/orders/:id/cancel` | Admin | Cancel order | (Future) | ✅ Backend exists |

**Current Implementation:** ⚠️ **Backend exists but frontend using localStorage**  
**Action Required:** Replace `ActiveRequests.jsx` localStorage calls with `adminAPI` calls

---

## 🆔 KYC APIs

### Scrapper KYC
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `POST` | `/kyc` | Scrapper | Submit KYC documents (FormData) | `KYCUploadPage.jsx` | ✅ Connected |
| `GET` | `/kyc/me` | Scrapper | Get my KYC status | `KYCStatusPage.jsx`, `ScrapperDashboard.jsx` | ✅ Connected |

### Admin KYC Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/kyc/scrappers?status=` | Admin | Get all scrappers with KYC | `KYCQueue.jsx` | ✅ Backend exists |
| `POST` | `/kyc/:scrapperId/verify` | Admin | Verify scrapper KYC | `KYCQueue.jsx` | ✅ Backend exists |
| `POST` | `/kyc/:scrapperId/reject` | Admin | Reject scrapper KYC | `KYCQueue.jsx` | ✅ Backend exists |

**Current Implementation:** ✅ Fully connected

---

## 💳 Subscription APIs

### Scrapper Subscription
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/subscriptions/plans` | Public/Private | Get all subscription plans | `SubscriptionPlanPage.jsx` | ✅ Connected |
| `GET` | `/subscriptions/plans/:id` | Public/Private | Get plan by ID | (Future) | ✅ Backend exists |
| `GET` | `/subscriptions/my-subscription` | Scrapper | Get my subscription | `SubscriptionPlanPage.jsx` | ✅ Connected |
| `POST` | `/subscriptions/subscribe` | Scrapper | Subscribe to a plan | `SubscriptionPlanPage.jsx` | ✅ Connected |
| `POST` | `/subscriptions/verify-payment` | Scrapper | Verify subscription payment | `SubscriptionPlanPage.jsx` | ✅ Connected |
| `POST` | `/subscriptions/cancel` | Scrapper | Cancel subscription | (Future) | ✅ Backend exists |
| `POST` | `/subscriptions/renew` | Scrapper | Renew subscription | (Future) | ✅ Backend exists |
| `GET` | `/subscriptions/history` | Scrapper | Get subscription history | (Future) | ✅ Backend exists |

### Admin Subscription Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `POST` | `/admin/subscriptions/plans` | Admin | Create subscription plan | (Future) | ✅ Backend exists |
| `PUT` | `/admin/subscriptions/plans/:id` | Admin | Update subscription plan | (Future) | ✅ Backend exists |
| `DELETE` | `/admin/subscriptions/plans/:id` | Admin | Delete subscription plan | (Future) | ✅ Backend exists |
| `GET` | `/admin/subscriptions/all` | Admin | Get all subscriptions | (Future) | ✅ Backend exists |

**Current Implementation:** ✅ Fully connected

---

## 💰 Payment APIs

### User/Scrapper Payments
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `POST` | `/payments/create-order` | User | Create payment order | `RequestStatusPage.jsx` | ✅ Connected |
| `POST` | `/payments/verify` | User | Verify payment | `RequestStatusPage.jsx` | ✅ Connected |
| `GET` | `/payments/order/:orderId/status` | User | Get payment status | (Future) | ✅ Backend exists |
| `GET` | `/payments/my-payments?` | User/Scrapper | Get my payments | (Future) | ✅ Backend exists |
| `POST` | `/payments/subscription/create` | Scrapper | Create subscription payment | `SubscriptionPlanPage.jsx` | ✅ Connected |
| `POST` | `/payments/subscription/verify` | Scrapper | Verify subscription payment | `SubscriptionPlanPage.jsx` | ✅ Connected |

**Current Implementation:** ✅ Fully connected

---

## 🎛️ Admin Management APIs

### Dashboard & Analytics
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/admin/dashboard/stats` | Admin | Get dashboard statistics | `Dashboard.jsx` | ✅ Backend exists |
| `GET` | `/admin/analytics/payments` | Admin | Get payment analytics | (Future) | ✅ Backend exists |

### User Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/admin/users?page=&limit=` | Admin | Get all users | `UsersList.jsx` | ✅ Backend exists |
| `GET` | `/admin/users/:id` | Admin | Get user details | `UserDetail.jsx` | ✅ Backend exists |
| `PUT` | `/admin/users/:id` | Admin | Update user | (Future) | ✅ Backend exists |
| `PATCH` | `/admin/users/:id/block` | Admin | Block/unblock user | (Future) | ✅ Backend exists |
| `DELETE` | `/admin/users/:id` | Admin | Delete user | (Future) | ✅ Backend exists |

### Scrapper Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/admin/scrappers?status=&page=&limit=` | Admin | Get all scrappers | `ScrappersList.jsx` | ✅ Backend exists |
| `GET` | `/admin/scrappers/:id` | Admin | Get scrapper details | `ScrapperDetail.jsx` | ✅ Backend exists |
| `PUT` | `/admin/scrappers/:id` | Admin | Update scrapper | (Future) | ✅ Backend exists |
| `PATCH` | `/admin/scrappers/:id/status` | Admin | Update scrapper status (active/blocked) | (Future) | ✅ Backend exists |
| `DELETE` | `/admin/scrappers/:id` | Admin | Delete scrapper | (Future) | ✅ Backend exists |

### Price Feed Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/admin/prices` | Admin | Get all prices | `PriceFeedEditor.jsx` | ✅ Backend exists |
| `POST` | `/admin/prices` | Admin | Create price | `PriceFeedEditor.jsx` | ✅ Backend exists |
| `PUT` | `/admin/prices/:id` | Admin | Update price | `PriceFeedEditor.jsx` | ✅ Backend exists |
| `DELETE` | `/admin/prices/:id` | Admin | Delete price | `PriceFeedEditor.jsx` | ✅ Backend exists |

**Current Implementation:** ⚠️ **Backend exists, frontend partially connected**

---

## 💵 Earnings APIs (To Be Added)

### Scrapper Earnings
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/scrapper/earnings/summary?date_range=` | Scrapper | Get earnings summary (today/week/month/total) | `ScrapperDashboard.jsx` | ❌ **TO BE CREATED** |
| `GET` | `/scrapper/earnings/history?page=&limit=` | Scrapper | Get earnings history | (Future) | ❌ **TO BE CREATED** |
| `GET` | `/scrapper/earnings/breakdown?period=` | Scrapper | Get earnings breakdown by period | (Future) | ❌ **TO BE CREATED** |

### Admin Earnings Management
| Method | Endpoint | Role | Description | Frontend Usage | Status |
|--------|----------|------|-------------|----------------|--------|
| `GET` | `/admin/scrappers/:id/earnings?date_range=` | Admin | Get scrapper earnings | (Future) | ❌ **TO BE CREATED** |
| `GET` | `/admin/scrappers/:id/earnings/history` | Admin | Get scrapper earnings history | (Future) | ❌ **TO BE CREATED** |
| `POST` | `/admin/scrappers/:id/earnings/adjust` | Admin | Adjust scrapper earnings | (Future) | ❌ **TO BE CREATED** |

**Current Implementation:** ❌ **Not implemented - using localStorage**  
**Action Required:** Create backend endpoints + frontend API functions

---

## 📱 Screen-to-Endpoint Mapping

### Scrapper Module Screens

#### 1. `ScrapperLogin.jsx`
- **POST** `/auth/login-otp` - Send OTP
- **POST** `/auth/verify-otp` - Verify OTP
- **POST** `/auth/register` - Register scrapper
- **POST** `/auth/resend-otp` - Resend OTP
- **GET** `/auth/me` - Verify auth after login

#### 2. `ScrapperDashboard.jsx`
- **GET** `/auth/me` - Verify scrapper auth
- **GET** `/kyc/me` - Check KYC status
- **GET** `/subscriptions/my-subscription` - Check subscription
- **GET** `/scrapper/earnings/summary` - Get earnings (TO BE ADDED)
- **GET** `/orders/my-assigned?status=in_progress` - Get active requests count (TO BE CONNECTED)

#### 3. `KYCUploadPage.jsx`
- **POST** `/kyc` - Submit KYC documents

#### 4. `KYCStatusPage.jsx`
- **GET** `/kyc/me` - Get KYC status

#### 5. `SubscriptionPlanPage.jsx`
- **GET** `/subscriptions/plans` - Get plans
- **GET** `/subscriptions/my-subscription` - Check current subscription
- **POST** `/subscriptions/subscribe` - Subscribe
- **POST** `/subscriptions/verify-payment` - Verify payment

#### 6. `ActiveRequestsPage.jsx` (Scrapper goes online)
- **GET** `/orders/available` - Get available orders (TO BE CONNECTED - currently localStorage)

#### 7. `MyActiveRequestsPage.jsx`
- **GET** `/orders/my-assigned?status=in_progress` - Get active requests (TO BE CONNECTED - currently localStorage)

#### 8. `ActiveRequestDetailsPage.jsx`
- **GET** `/orders/:id` - Get order details (TO BE CONNECTED - currently localStorage)
- **POST** `/orders/:id/accept` - Accept order (already exists, but not used)
- **PUT** `/orders/:id/status` - Update status (on_the_way, picked_up, payment_pending, completed) (TO BE CONNECTED)
- **GET** `/scrapper/earnings/summary` - Update earnings after completion (TO BE ADDED)

#### 9. `ScrapperProfile.jsx`
- **GET** `/auth/me` - Get scrapper profile
- **PUT** `/auth/profile` - Update profile

---

### Admin Module Screens

#### 1. `AdminLogin.jsx`
- **POST** `/auth/login` - Password-based login (TO BE CREATED - currently mock)

#### 2. `Dashboard.jsx` (Admin)
- **GET** `/admin/dashboard/stats` - Get dashboard stats (TO BE CONNECTED)

#### 3. `ActiveRequests.jsx` (Admin)
- **GET** `/admin/orders?status=pending` - Get pending orders (TO BE CONNECTED - currently localStorage)
- **POST** `/admin/orders/:id/assign` - Assign order to scrapper (TO BE CONNECTED - currently prompt)

#### 4. `KYCQueue.jsx`
- **GET** `/kyc/scrappers?status=pending` - Get pending KYC (TO BE CONNECTED)
- **POST** `/kyc/:scrapperId/verify` - Verify KYC (TO BE CONNECTED)
- **POST** `/kyc/:scrapperId/reject` - Reject KYC (TO BE CONNECTED)

#### 5. `ScrappersList.jsx`
- **GET** `/admin/scrappers?status=` - Get all scrappers (TO BE CONNECTED)

#### 6. `ScrapperDetail.jsx`
- **GET** `/admin/scrappers/:id` - Get scrapper details (TO BE CONNECTED)
- **GET** `/admin/scrappers/:id/earnings` - Get scrapper earnings (TO BE ADDED)
- **PATCH** `/admin/scrappers/:id/status` - Block/unblock scrapper (TO BE CONNECTED)

#### 7. `PriceFeedEditor.jsx`
- **GET** `/admin/prices` - Get all prices (TO BE CONNECTED)
- **POST** `/admin/prices` - Create price (TO BE CONNECTED)
- **PUT** `/admin/prices/:id` - Update price (TO BE CONNECTED)
- **DELETE** `/admin/prices/:id` - Delete price (TO BE CONNECTED)

---

## 🔧 Missing API Functions (To Be Added in `api.js`)

### Scrapper Orders API
```javascript
export const scrapperOrdersAPI = {
  getAvailable: async (query = '') => {
    return apiRequest(`/orders/available${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
  getMyAssigned: async (query = '') => {
    return apiRequest(`/orders/my-assigned${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
  accept: async (id) => {
    return apiRequest(`/orders/${id}/accept`, {
      method: 'POST',
    });
  },
};
```

### Admin Orders API
```javascript
export const adminOrdersAPI = {
  getAll: async (query = '') => {
    return apiRequest(`/admin/orders${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
  getById: async (id) => {
    return apiRequest(`/admin/orders/${id}`, {
      method: 'GET',
    });
  },
  assign: async (id, scrapperId) => {
    return apiRequest(`/admin/orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ scrapperId }),
    });
  },
  cancel: async (id, reason) => {
    return apiRequest(`/admin/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
```

### Earnings API
```javascript
export const earningsAPI = {
  // Scrapper earnings
  getSummary: async (query = '') => {
    return apiRequest(`/scrapper/earnings/summary${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
  getHistory: async (query = '') => {
    return apiRequest(`/scrapper/earnings/history${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
  // Admin earnings
  getScrapperEarnings: async (scrapperId, query = '') => {
    return apiRequest(`/admin/scrappers/${scrapperId}/earnings${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
  adjustEarnings: async (scrapperId, adjustmentData) => {
    return apiRequest(`/admin/scrappers/${scrapperId}/earnings/adjust`, {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  },
};
```

---

## 📊 Implementation Status Summary

| Category | Backend Status | Frontend Status | Action Required |
|----------|---------------|-----------------|-----------------|
| **Auth** | ✅ Complete | ✅ Connected | None |
| **User Orders** | ✅ Complete | ✅ Connected | None |
| **Scrapper Orders** | ✅ Complete | ⚠️ Using localStorage | Replace localStorage with API calls |
| **Admin Orders** | ✅ Complete | ⚠️ Using localStorage | Replace localStorage with API calls |
| **KYC** | ✅ Complete | ✅ Connected | None |
| **Subscription** | ✅ Complete | ✅ Connected | None |
| **Payment** | ✅ Complete | ✅ Connected | None |
| **Admin Management** | ✅ Complete | ⚠️ Partially connected | Connect remaining screens |
| **Earnings** | ❌ Not created | ❌ Using localStorage | Create backend endpoints + frontend API |

---

## ✅ Phase 1 Deliverables

1. ✅ **API Contract Document** (This document)
2. ⏳ **Update `apiConfig.js`** - Add missing endpoints
3. ⏳ **Update `api.js`** - Add missing API functions
4. ⏳ **Review & Testing** - Team review of contract

---

## 🚀 Next Steps (Phase 2)

After Phase 1 completion:
- Phase 2: Replace `scrapperRequestUtils.js` localStorage calls with backend APIs
- Phase 3: Implement earnings backend + frontend
- Phase 4: Connect all admin screens to backend
- Phase 5: Testing & polishing

---

**Document Version:** 1.0  
**Created:** Phase 1  
**Last Updated:** Phase 1




