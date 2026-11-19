/* eslint-disable @typescript-eslint/no-explicit-any */
// Maps database rows (snake_case) to the shapes the UI already uses (camelCase).

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatIdDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function relativeTimeId(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.round(diff / 60000);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.round(hr / 24);
  return day === 1 ? 'Kemarin' : `${day} hari lalu`;
}

export const mapProduct = (r: any) => ({
  id: r.id,
  categoryTitle: r.category_title,
  name: r.name,
  category: r.category,
  priceNow: r.price_now,
  priceOrig: r.price_orig,
  condition: r.condition,
  score: r.score,
  fabric: r.fabric,
  colorScheme: r.color_scheme,
  iconText: r.icon_text,
  imageUrl: r.image_url,
  description: r.description,
  seller: r.seller,
  location: r.location,
});

export const mapListing = (r: any) => ({
  id: r.id,
  title: r.title,
  brand: r.brand,
  category: r.category,
  size: r.size,
  color: r.color,
  price: r.price,
  originalPrice: r.original_price,
  aiScore: r.ai_score,
  conditionLabel: r.condition_label,
  aiDescription: r.ai_description,
  imageUrl: r.image_url,
  imageAlt: r.image_alt,
  seller: {
    name: r.seller_name,
    rating: Number(r.seller_rating),
    totalSales: r.seller_total_sales,
    location: r.seller_location,
    avatar: r.seller_avatar,
  },
  listedAt: r.listed_at,
  tags: r.tags || [],
  isVerified: r.is_verified,
});

export const mapPartner = (r: any) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  categoryLabel: r.category_label,
  lat: r.lat,
  lng: r.lng,
  rating: Number(r.rating),
  reviewsCount: r.reviews_count,
  estimatedPrice: r.estimated_price,
  isVerified: r.is_verified,
  address: r.address,
  services: r.services || [],
  openHours: r.open_hours,
  minOrder: r.min_order,
  badge: r.badge || undefined,
});

export const mapNotification = (r: any) => ({
  id: r.id,
  title: r.title,
  desc: r.descr,
  time: relativeTimeId(r.created_at),
  timestamp: new Date(r.created_at).getTime(),
  unread: r.unread,
  type: r.type,
  categoryLabel: r.category_label,
  targetHref: r.target_href,
  actionText: r.action_text,
  details: r.details,
  icon: r.icon,
  orderNumber: r.order_number || undefined,
  badgeColor: r.badge_color || undefined,
});

export const mapGarment = (r: any) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  categoryType: r.category_type,
  scanDate: formatIdDate(r.scan_date),
  score: r.score,
  statusBadge: r.status_badge,
  summary: r.summary,
  fabric: r.fabric,
  iconText: r.icon_text,
  parameters: r.parameters,
  careSteps: r.care_steps,
  recommendationAction: r.recommendation_action,
});

export const mapCartItem = (r: any) => ({
  id: r.id,
  storeName: r.store_name,
  category: r.category,
  title: r.title,
  condition: r.condition,
  price: r.price,
  originalPrice: r.original_price,
  selected: r.selected,
  emoji: r.emoji,
  imageUrl: r.image_url,
  isClothing: r.is_clothing,
  color: r.color,
  size: r.size || undefined,
  brand: r.brand || undefined,
});

export const mapUser = (r: any) => ({
  id: r.id,
  username: r.username,
  name: r.full_name,
  email: r.email,
  avatar: r.avatar,
  city: r.city,
  role: r.role,
  level: r.level,
  isVerified: r.is_verified,
});
