/** Shapes returned by /api/admin/users (admin dashboard + Kelola Pengguna). */
export interface AdminUser {
  id: string; username: string; name: string; email: string | null; avatar: string; city: string | null;
  role: 'user' | 'seller' | 'admin'; level: string | null; isVerified: boolean; joinedAt: string;
  balance: number; escrowHeld: number; buyerOrders: number; mitraOrders: number; disputes: number; mitraRevenue: number;
}
export interface UsersOverview {
  users: AdminUser[];
  counts: { customer: number; mitra: number; admin: number };
  orders: { total: number; active: number; completed: number; gmv: number };
}
