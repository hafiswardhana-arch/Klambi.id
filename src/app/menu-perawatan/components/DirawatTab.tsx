'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import ProviderCard, { Provider } from '@/components/ui/ProviderCard';
import BookingModal from './BookingModal';

type ServiceType = 'jasa' | 'produk';
type JasaType = 'binatu' | 'recolor';

const carePlanSteps = [
{
  id: 'care-step-1',
  category: 'Cara Cuci',
  difficulty: 'mudah' as const,
  icon: 'BeakerIcon',
  steps: [
  'Cuci dengan air dingin (maks 30°C)',
  'Gunakan deterjen khusus pakaian berwarna',
  'Balikkan baju sebelum dicuci',
  'Hindari pemutih apapun']

},
{
  id: 'care-step-2',
  category: 'Cara Simpan',
  difficulty: 'mudah' as const,
  icon: 'ArchiveBoxIcon',
  steps: [
  'Gantung, jangan dilipat',
  'Hindari paparan sinar matahari langsung',
  'Simpan di tempat kering & berventilasi']

},
{
  id: 'care-step-3',
  category: 'Pemulihan Warna',
  difficulty: 'sedang' as const,
  icon: 'EyeDropperIcon',
  steps: [
  'Rendam dalam campuran cuka putih & air (1:4) selama 30 menit',
  'Bilas dengan air dingin',
  'Atau gunakan jasa recolor profesional']

}];


const binatuProviders: Provider[] = [
{
  id: 'binatu-001',
  name: 'Laundry Bersih Kilat',
  type: 'binatu',
  rating: 4.8,
  reviewCount: 512,
  distance: '0.5 km',
  priceRange: 'Rp 8.000/kg',
  services: ['Cuci Kilogram', 'Cuci Express', 'Setrika', 'Jemput Antar'],
  availability: 'available',
  turnaround: '1 hari',
  avatar: 'LB',
  location: 'Jl. Anggrek No. 3, Bandung',
  matchScore: 92
},
{
  id: 'binatu-002',
  name: 'Recolor Studio Bandung',
  type: 'recolor',
  rating: 4.9,
  reviewCount: 178,
  distance: '1.1 km',
  priceRange: 'Rp 45.000 – 120.000',
  services: ['Pewarnaan Ulang', 'Tie-dye', 'Pemudaan Warna', 'Konsultasi Warna'],
  availability: 'available',
  turnaround: '3–5 hari',
  avatar: 'RS',
  location: 'Jl. Braga No. 17, Bandung',
  matchScore: 98
},
{
  id: 'binatu-003',
  name: 'Fresh Wash & Care',
  type: 'binatu',
  rating: 4.6,
  reviewCount: 289,
  distance: '1.8 km',
  priceRange: 'Rp 7.000/kg',
  services: ['Cuci Standar', 'Dry Clean', 'Setrika', 'Parfum Laundry'],
  availability: 'available',
  turnaround: '2 hari',
  avatar: 'FW',
  location: 'Jl. Dago No. 55, Bandung',
  matchScore: 81
}];


const recommendedProducts = [
{
  id: 'prod-001',
  name: 'Molto Pewangi & Pelembut',
  brand: 'Molto',
  price: 12500,
  category: 'Pewangi',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1290872b8-1785165008529.png",
  imageAlt: 'Botol pewangi pakaian berwarna biru muda',
  rating: 4.5,
  relevance: 'Mengembalikan kelembutan kain'
},
{
  id: 'prod-002',
  name: 'Color Guard Deterjen Warna',
  brand: 'Attack',
  price: 18900,
  category: 'Deterjen',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_19a9d96ab-1767745675033.png",
  imageAlt: 'Kemasan deterjen cair khusus pakaian berwarna',
  rating: 4.7,
  relevance: 'Mencegah warna pudar lebih lanjut'
},
{
  id: 'prod-003',
  name: 'Cuka Putih Serbaguna',
  brand: 'Cap Bunga',
  price: 8500,
  category: 'Bahan Alami',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_196dc52bc-1786583762140.png",
  imageAlt: 'Botol cuka putih serbaguna untuk perawatan pakaian',
  rating: 4.3,
  relevance: 'Membantu memulihkan kecerahan warna'
}];


export default function DirawatTab() {
  const [serviceType, setServiceType] = useState<ServiceType>('jasa');
  const [jasaType, setJasaType] = useState<JasaType>('recolor');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>('care-step-3');

  const filteredProviders = binatuProviders.filter((p) =>
  jasaType === 'recolor' ? p.type === 'recolor' : p.type === 'binatu'
  );

  const difficultyConfig = {
    mudah: { color: 'text-accent', bg: 'bg-secondary', label: 'Mudah' },
    sedang: { color: 'text-warning', bg: 'bg-warning-bg', label: 'Sedang' },
    sulit: { color: 'text-danger', bg: 'bg-danger-bg', label: 'Sulit' }
  };

  return (
    <div className="space-y-4">
      {/* Care Plan */}
      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <Icon name="ClipboardDocumentListIcon" size={15} variant="solid" className="text-accent" />
          </div>
          <p className="text-sm font-700 text-foreground">Care Plan AI</p>
        </div>
        {carePlanSteps.map((plan) => {
          const isOpen = expandedPlan === plan.id;
          const diff = difficultyConfig[plan.difficulty];
          return (
            <div key={plan.id} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedPlan(isOpen ? null : plan.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
                aria-expanded={isOpen}>
                
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon name={plan.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-600 text-foreground">{plan.category}</p>
                </div>
                <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>
                  {diff.label}
                </span>
                <Icon
                  name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                  size={16}
                  className="text-muted-foreground flex-shrink-0" />
                
              </button>
              {isOpen &&
              <div className="px-3 pb-3 space-y-1.5 border-t border-border pt-3 animate-fade-in">
                  {plan.steps.map((step, si) =>
                <div key={`step-${plan.id}-${si}`} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-secondary text-primary text-[10px] font-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {si + 1}
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                    </div>
                )}
                </div>
              }
            </div>);

        })}
      </div>

      {/* Action Choice */}
      <div className="flex gap-2">
        {[
        { key: 'jasa' as ServiceType, label: 'Pakai Jasa', icon: 'BuildingStorefrontIcon' },
        { key: 'produk' as ServiceType, label: 'Beli Produk', icon: 'ShoppingCartIcon' }].
        map((opt) =>
        <button
          key={`service-type-${opt.key}`}
          onClick={() => setServiceType(opt.key)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-600 border transition-all duration-200 ${
          serviceType === opt.key ?
          'bg-primary text-white border-primary shadow-card' :
          'bg-card text-muted-foreground border-border hover:border-accent'}`
          }>
          
            <Icon
            name={opt.icon as Parameters<typeof Icon>[0]['name']}
            size={16}
            className={serviceType === opt.key ? 'text-white' : 'text-muted-foreground'} />
          
            {opt.label}
          </button>
        )}
      </div>

      {/* Jasa Section */}
      {serviceType === 'jasa' &&
      <div className="space-y-3 animate-fade-in">
          {/* Jasa Type Filter */}
          <div className="flex gap-2">
            {[
          { key: 'recolor' as JasaType, label: 'Recolor', icon: 'EyeDropperIcon' },
          { key: 'binatu' as JasaType, label: 'Binatu / Cuci', icon: 'BeakerIcon' }].
          map((jt) =>
          <button
            key={`jasa-type-${jt.key}`}
            onClick={() => setJasaType(jt.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-600 border transition-all ${
            jasaType === jt.key ?
            'bg-secondary text-primary border-accent' : 'bg-card text-muted-foreground border-border hover:border-border/80'}`
            }>
            
                <Icon name={jt.icon as Parameters<typeof Icon>[0]['name']} size={14} />
                {jt.label}
              </button>
          )}
          </div>

          <p className="text-xs text-muted-foreground">
            {filteredProviders.length} penyedia {jasaType} terdekat
          </p>

          {filteredProviders.map((provider) =>
        <ProviderCard
          key={`dirawat-provider-${provider.id}`}
          provider={provider}
          onSelect={setSelectedProvider}
          selected={selectedProvider?.id === provider.id} />

        )}

          {selectedProvider &&
        <div className="sticky bottom-[80px]">
              <button
            onClick={() => setShowBooking(true)}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            
                <Icon name="CalendarDaysIcon" size={18} className="text-white" />
                Pesan {selectedProvider.name}
              </button>
            </div>
        }
        </div>
      }

      {/* Produk Section */}
      {serviceType === 'produk' &&
      <div className="space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground font-500">
            Produk yang direkomendasikan AI berdasarkan masalah bajumu
          </p>
          {recommendedProducts.map((product) =>
        <div
          key={`product-${product.id}`}
          className="card-elevated p-3 flex items-center gap-3 card-hover">
          
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                <AppImage
              src={product.imageUrl}
              alt={product.imageAlt}
              width={56}
              height={56}
              className="object-cover w-full h-full" />
            
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-700 text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand} · {product.category}</p>
                <p className="text-[11px] text-accent mt-0.5">{product.relevance}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-700 text-primary font-tabular">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <button className="mt-1 text-xs bg-primary text-white px-3 py-1 rounded-lg font-600 hover:bg-primary/90 transition-colors active:scale-95">
                  Beli
                </button>
              </div>
            </div>
        )}
        </div>
      }

      {showBooking && selectedProvider &&
      <BookingModal
        provider={selectedProvider}
        onClose={() => setShowBooking(false)} />

      }
    </div>);

}

// Need AppImage import
import AppImage from '@/components/ui/AppImage';