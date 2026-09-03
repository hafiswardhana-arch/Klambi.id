'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface ScannedGarment {
  id: string;
  title: string;
  category: string;
  categoryType: 'Kemeja' | 'Outerwear' | 'Celana' | 'Dress' | 'Kaos';
  scanDate: string;
  score: number;
  statusBadge: 'Baik' | 'Perlu Perawatan' | 'Perlu Jasa';
  summary: string;
  fabric: string;
  iconText: string;
  parameters: {
    cleanliness: string;
    fading: string;
    fiber: string;
    damage: string;
  };
  careSteps: { text: string; done: boolean }[];
  recommendationAction: string;
}

const initialScannedGarments: ScannedGarment[] = [
  {
    id: 'sg-1',
    title: 'Kemeja Flannel Sage Green',
    category: 'Kemeja',
    categoryType: 'Kemeja',
    scanDate: '22 Agu 2026',
    score: 86,
    statusBadge: 'Baik',
    summary: 'Kondisi serat kain sangat terjaga. Bebas noda membandel.',
    fabric: '100% Katun Organik',
    iconText: '👔',
    parameters: {
      cleanliness: '95/100 (Sangat Bersih)',
      fading: '90/100 (Warna Cerah)',
      fiber: '88/100 (Serat Utuh)',
      damage: 'Tidak ada robekan',
    },
    careSteps: [
      { text: 'Gunakan air dingin (suhu maksimal 30°C) saat mencuci.', done: true },
      { text: 'Balik pakaian ke dalam sebelum dicuci agar warna kain tidak tergesek.', done: true },
      { text: 'Gunakan deterjen lembaran ramah lingkungan (Kindfoam / eco-detergent).', done: false },
      { text: 'Jemur di tempat teduh dengan sirkulasi udara baik, hindari terik matahari langsung.', done: false },
    ],
    recommendationAction: 'Perawatan mandiri di rumah sudah optimal. Tidak memerlukan jasa permak.',
  },
  {
    id: 'sg-2',
    title: 'Jaket Denim Vintage Levi\'s 501',
    category: 'Outerwear',
    categoryType: 'Outerwear',
    scanDate: '18 Agu 2026',
    score: 67,
    statusBadge: 'Perlu Perawatan',
    summary: 'Warna agak pudar di area siku & aroma serat kain lembab.',
    fabric: 'Heavyweight Denim Twill 14oz',
    iconText: '🧥',
    parameters: {
      cleanliness: '75/100 (Perlu Deep Clean)',
      fading: '65/100 (Pudar Sedang)',
      fiber: '78/100 (Serat Kuat)',
      damage: 'Jahitan saku samping longgar',
    },
    careSteps: [
      { text: 'Lakukan Deep Clean & Spa Anti-Odor untuk menghilangkan jamur mikroba.', done: false },
      { text: 'Rendam dengan larutan cuka putih 1 sendok makan untuk mengunci pigmen indigo.', done: false },
      { text: 'Jangan diperas terlalu keras menggunakan mesin pengering putar tinggi.', done: false },
      { text: 'Gantung menggunakan hanger kayu berbahu lebar.', done: false },
    ],
    recommendationAction: 'Disarankan melakukan Deep Clean & Anti-Odor Spa agar serat kembali segar.',
  },
  {
    id: 'sg-3',
    title: 'Celana Chino Slim Fit',
    category: 'Celana',
    categoryType: 'Celana',
    scanDate: '10 Agu 2026',
    score: 52,
    statusBadge: 'Perlu Jasa',
    summary: 'Jahitan kelim bawah terlepas sepanjang 8 cm & kancing longgar.',
    fabric: 'Twill Cotton Stretch 98% / Elastane 2%',
    iconText: '👖',
    parameters: {
      cleanliness: '80/100 (Bersih)',
      fading: '70/100 (Pudar Ringan)',
      fiber: '65/100 (Karet Mulai Melar)',
      damage: 'Kelim bawah robek 8 cm',
    },
    careSteps: [
      { text: 'Perbaiki jahitan kelim bawah menggunakan teknik chainstitch atau hemming rapi.', done: false },
      { text: 'Kencangkan kembali kancing pinggang sebelum dicuci.', done: false },
      { text: 'Hindari penggunaan pemutih klorin.', done: false },
    ],
    recommendationAction: 'Perlu bantuan tukang jahit / Taylor artisan terdekat untuk perbaikan jahitan kelim.',
  },
  {
    id: 'sg-4',
    title: 'Dress Tenun Ikat Tradisional',
    category: 'Dress',
    categoryType: 'Dress',
    scanDate: '05 Agu 2026',
    score: 92,
    statusBadge: 'Baik',
    summary: 'Serat tenun tangan istimewa. Tidak ada benang lepas.',
    fabric: 'Tenun Pewarna Alami',
    iconText: '👗',
    parameters: {
      cleanliness: '98/100 (Bersih Terawat)',
      fading: '95/100 (Pewarna Alami Terkunci)',
      fiber: '92/100 (Anyaman Padat)',
      damage: 'Sempurna',
    },
    careSteps: [
      { text: 'Gunakan lerak atau sabun khusus kain tradisional saat mencuci.', done: true },
      { text: 'Cuci manual secara perlahan dengan tangan tanpa disikat.', done: true },
      { text: 'Angin-anginkan di dalam ruangan hingga kering.', done: true },
    ],
    recommendationAction: 'Kondisi pakaian sangat prima. Terus terapkan teknik cuci tradisional.',
  },
  {
    id: 'sg-5',
    title: 'Kaos Heavyweight Vintage Band Tee',
    category: 'Kaos',
    categoryType: 'Kaos',
    scanDate: '01 Agu 2026',
    score: 78,
    statusBadge: 'Baik',
    summary: 'Sablon plastisol utuh, kerah leher tetap kencang.',
    fabric: '100% Combed Cotton 20s',
    iconText: '👕',
    parameters: {
      cleanliness: '92/100 (Bersih)',
      fading: '82/100 (Vintage Fade Estetik)',
      fiber: '85/100 (Kerah Kencang)',
      damage: 'Tidak ada lubang ngengat',
    },
    careSteps: [
      { text: 'Setrika selalu dari bagian dalam (terbalik) agar sablon grafis tidak meleleh.', done: true },
      { text: 'Hindari peras putar berlebihan agar kerah rib tidak cepat keriting.', done: true },
      { text: 'Gunakan deterjen bebas pemutih optik.', done: false },
    ],
    recommendationAction: 'Pakaian terawat sangat baik. Pertahankan cara cuci terbalik.',
  },
];

const careGuides = [
  {
    id: 'cg-1',
    icon: '💧',
    title: 'Metode Cuci Ramah Lingkungan',
    category: 'Pencucian',
    difficulty: 'Mudah',
    timeEst: '15 Menit',
    desc: 'Tips mencuci pakaian tanpa merusak serat kain dan hemat konsumsi air.',
    steps: [
      'Pilah pakaian berdasarkan warna (terang, gelap, putih) dan tingkat kotoran.',
      'Gunakan takaran deterjen lembaran ramah lingkungan Kindfoam agar bebas residu kimia.',
      'Gunakan mode cold water (air dingin) untuk menghemat 70% energi mesin cuci.',
      'Hindari siklus cuci air panas kecuali untuk pakaian dengan noda minyak berat.',
    ],
  },
  {
    id: 'cg-2',
    icon: '☀️',
    title: 'Pengeringan & Penjemuran Alami',
    category: 'Pengeringan',
    difficulty: 'Mudah',
    timeEst: 'Alami',
    desc: 'Mencegah pemudaran warna kain akibat sinar UV berlebih.',
    steps: [
      'Selalu jemur pakaian dalam kondisi terbalik (sisi dalam menghadap ke luar).',
      'Untuk pakaian berbahan rajut/wool, jemur secara mendatar (flat dry) agar tidak melar gravitasi.',
      'Gunakan jepitan baju berbahan kayu atau berlapis silikon agar tidak meninggalkan bekas pada bahu.',
      'Hindari mesin pengering bersuhu tinggi untuk pakaian katun stretch dan linen.',
    ],
  },
  {
    id: 'cg-3',
    icon: '🛡️',
    title: 'Penyimpanan Anti-Jamur & Ngengat',
    category: 'Penyimpanan',
    difficulty: 'Mudah',
    timeEst: '10 Menit',
    desc: 'Menjaga pakaian tetap harum dan bebas apek di dalam lemari.',
    steps: [
      'Pastikan pakaian sudah 100% kering sebelum dilipat atau dimasukkan lemari.',
      'Gunakan kantong penyerap lembap (silica gel / arang aktif / cedarwood) di sudut lemari.',
      'Beri ruang 1-2 cm antar gantungan baju agar ada sirkulasi udara yang baik.',
      'Gunakan dust bag berbahan katun bernapas untuk jas dan busana berharga.',
    ],
  },
  {
    id: 'cg-4',
    icon: '🎨',
    title: 'Pemulihan Warna Pudar (Re-Colour)',
    category: 'Restorasi',
    difficulty: 'Sedang',
    timeEst: '45 Menit',
    desc: 'Cara mengembalikan ketajaman warna pakaian katun dan denim lama.',
    steps: [
      'Rendam pakaian dalam air dingin bercampur 1 cangkir garam dapur untuk mengunci warna baru.',
      'Gunakan pewarna tekstil ramah lingkungan bersertifikasi eco-friendly non-toksik.',
      'Bilas hingga air bilasan benar-benar bening sebelum dikeringkan.',
      'Bawa ke mitra spesialis re-colour Klámbi jika menginginkan hasil pewarnaan celup profesional.',
    ],
  },
  {
    id: 'cg-5',
    icon: '☕',
    title: 'Pembersih Noda Darurat (Kopi, Teh & Minyak)',
    category: 'Noda Spesifik',
    difficulty: 'Mudah',
    timeEst: '5 Menit',
    desc: 'Solusi kilat membersihkan noda tumpahan tanpa merusak kain.',
    steps: [
      'Segera tekan area noda dengan tisu kering/kain bersih (jangan digosok melebar).',
      'Teteskan campuran sabun cuci piring lembut dan air dingin, lalu usap perlahan dari belakang noda.',
      'Untuk noda kopi membandel, gunakan larutan cuka putih encer (1:2 dengan air).',
      'Bilas dengan air mengalir dingin hingga noda terangkat sempurna.',
    ],
  },
];

const fabricKnowledge = [
  {
    name: 'Katun Alami (Cotton)',
    temp: '30°C - 40°C',
    ironTemp: 'Suhu Sedang - Tinggi',
    icon: '🌿',
    care: 'Cuci biasa dengan deterjen ramah lingkungan, setrika saat kain agak lembab, sangat tahan lama & bernapas.',
    tips: 'Hindari pemutih klorin agar serat tidak getas.',
  },
  {
    name: 'Denim Indigo (Jeans)',
    temp: 'Air Dingin (< 25°C)',
    ironTemp: 'Suhu Sedang (Terbalik)',
    icon: '👖',
    care: 'Jarang dicuci (cukup angin-anginkan jika tidak kotor), cuci terbalik, jemur di tempat teduh agar kontras warna pudar alami (fades) tetap indah.',
    tips: 'Rendam air garam dingin di cucian pertama.',
  },
  {
    name: 'Sutra & Rayon (Silk)',
    temp: 'Handwash Air Dingin',
    ironTemp: 'Suhu Rendah / Steamer',
    icon: '✨',
    care: 'Cuci manual sangat lembut, jangan diperas atau dipelintir kencang, gunakan deterjen pH netral khusus kain halus.',
    tips: 'Keringkan dengan cara digulung dalam handuk kering.',
  },
  {
    name: 'Wool & Rajut (Knitwear)',
    temp: 'Air Dingin Khusus Wool',
    ironTemp: 'Setrika Uap / Steam',
    icon: '🧶',
    care: 'Gunakan deterjen khusus wool atau Kindfoam, jemur secara mendatar di atas handuk (flat dry), jangan pernah digantung di hanger pundak sempit.',
    tips: 'Simpan terlipat rapi dengan bola kayu cedar.',
  },
  {
    name: 'Linen Alami',
    temp: '30°C Siklus Lembut',
    ironTemp: 'Suhu Tinggi (Kain Lembab)',
    icon: '🌾',
    care: 'Memiliki tekstur kusut alami yang estetik, menyerap keringat maksimal, semakin dicuci semakin lembut.',
    tips: 'Setrika selagi kain masih setengah lembap untuk hasil rapi.',
  },
  {
    name: 'Poliester & Parasut (Synthetics)',
    temp: 'Air Dingin - 30°C',
    ironTemp: 'Suhu Sangat Rendah',
    icon: '🎽',
    care: 'Cepat kering dan tidak mudah kusut. Jangan disetrika terlalu panas karena bahan sintetis rentan meleleh atau mengkilap.',
    tips: 'Gunakan washing bag micro-fiber untuk mencegah mikroplastik terlepas ke air.',
  },
];

const careSchedules = [
  {
    id: 'sch-1',
    title: 'Aerasi & Angin-anginkan Jaket Denim',
    category: 'Outerwear',
    frequency: 'Setiap 2 minggu',
    dateBadge: '3 hari lagi',
    icon: '🧥',
    isActive: true,
  },
  {
    id: 'sch-2',
    title: 'Ganti Silica Gel / Arang Lemari Pakaian',
    category: 'Penyimpanan',
    frequency: 'Setiap 1 bulan',
    dateBadge: '12 September',
    icon: '🛡️',
    isActive: true,
  },
  {
    id: 'sch-3',
    title: 'Deep Clean Pakaian Rajut & Wool',
    category: 'Knitwear',
    frequency: 'Setiap 2 bulan',
    dateBadge: '30 September',
    icon: '🧶',
    isActive: false,
  },
];

export default function RawatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'care_plan' | 'panduan' | 'kain' | 'kalkulator' | 'jadwal'>('care_plan');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Semua');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [garments, setGarments] = useState<ScannedGarment[]>(initialScannedGarments);
  const [selectedGarment, setSelectedGarment] = useState<ScannedGarment | null>(null);
  const [schedules, setSchedules] = useState(careSchedules);

  // Eco Calculator State
  const [loadWeightKg, setLoadWeightKg] = useState<number>(4);

  const garmentCategories = ['Semua', 'Kemeja', 'Outerwear', 'Celana', 'Dress', 'Kaos'];
  const statusOptions = ['Semua', 'Baik', 'Perlu Perawatan', 'Perlu Jasa'];

  const filteredGarments = useMemo(() => {
    return garments.filter((g) => {
      const matchCat = selectedCategoryFilter === 'Semua' || g.categoryType === selectedCategoryFilter;
      const matchStatus = selectedStatusFilter === 'Semua' || g.statusBadge === selectedStatusFilter;
      const matchQuery =
        searchQuery.trim() === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchQuery;
    });
  }, [garments, selectedCategoryFilter, selectedStatusFilter, searchQuery]);

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return careGuides;
    const q = searchQuery.toLowerCase();
    return careGuides.filter(
      (guide) =>
        guide.title.toLowerCase().includes(q) ||
        guide.desc.toLowerCase().includes(q) ||
        guide.category.toLowerCase().includes(q) ||
        guide.steps.some((step) => step.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const toggleStepDone = (garmentId: string, stepIndex: number) => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === garmentId) {
          const updatedSteps = [...g.careSteps];
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            done: !updatedSteps[stepIndex].done,
          };
          return { ...g, careSteps: updatedSteps };
        }
        return g;
      })
    );

    if (selectedGarment && selectedGarment.id === garmentId) {
      setSelectedGarment((prev) => {
        if (!prev) return null;
        const updatedSteps = [...prev.careSteps];
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          done: !updatedSteps[stepIndex].done,
        };
        return { ...prev, careSteps: updatedSteps };
      });
    }
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextState = !s.isActive;
          toast.success(
            nextState
              ? `Pengingat "${s.title}" telah diaktifkan!`
              : `Pengingat "${s.title}" dinonaktifkan`
          );
          return { ...s, isActive: nextState };
        }
        return s;
      })
    );
  };

  // Kindfoam Calculations
  // 1 sheet per 3-5 kg load
  const kindfoamSheets = Math.ceil(loadWeightKg / 4);
  const waterSavedLiters = Math.round(loadWeightKg * 8.5);
  const carbonSavedGrams = Math.round(loadWeightKg * 45);
  const costEstimateRupiah = kindfoamSheets * 1800;

  return (
    <AppLayout
      title="Rawat Pakaian"
      showBack
      backHref="/"
      headerRight={
        <button
          onClick={() => router.push('/wearwise-ai')}
          className="flex items-center gap-1.5 bg-[#10284D] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#152248] active:scale-95 transition-all"
        >
          <span>📷</span>
          <span className="hidden sm:inline">Scan Baju</span>
        </button>
      }
    >
      <div className="max-w-2xl mx-auto space-y-4 pb-24">
        {/* Banner Edukasi & Scan CTA */}
        <div className="bg-gradient-to-r from-[#10284D] via-[#1A3A6B] to-[#254E8C] text-white rounded-3xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1.5 z-10 max-w-[280px]">
            <div className="inline-flex items-center gap-1.5 bg-[#E8C547]/20 border border-[#E8C547]/40 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C547] animate-pulse" />
              <span className="text-[10px] font-extrabold text-[#E8C547] uppercase tracking-wider">
                Klámbi Care Center
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold leading-tight">
              Kenali Kondisinya, Rawat dengan Tepat!
            </h2>
            <p className="text-[11px] text-white/85 leading-relaxed">
              Pantau kesehatan pakaian, pelajari panduan eco-care, dan hitung dosis Kindfoam hemat air.
            </p>
          </div>

          <div className="flex flex-col gap-2 z-10 flex-shrink-0">
            <button
              onClick={() => router.push('/wearwise-ai')}
              className="bg-white text-[#10284D] px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-md hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>📷</span>
              <span>Scan Baru</span>
            </button>
            <button
              onClick={() => router.push('/menu-perawatan')}
              className="bg-white/15 text-white border border-white/30 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-white/25 active:scale-95 transition-all text-center"
            >
              Cari Jasa Permak →
            </button>
          </div>

          {/* Background Decorative Bubble */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-32 -top-6 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-border gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setActiveTab('care_plan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'care_plan'
                ? 'border-[#10284D] text-[#10284D]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="HeartIcon" size={15} />
            <span>Care Plan Baju ({garments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('panduan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'panduan'
                ? 'border-[#10284D] text-[#10284D]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="SparklesIcon" size={15} />
            <span>Panduan Rawat</span>
          </button>

          <button
            onClick={() => setActiveTab('kain')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'kain'
                ? 'border-[#10284D] text-[#10284D]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="InformationCircleIcon" size={15} />
            <span>Serat Kain</span>
          </button>

          <button
            onClick={() => setActiveTab('kalkulator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'kalkulator'
                ? 'border-[#10284D] text-[#10284D]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>🧼</span>
            <span>Eco-Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('jadwal')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'jadwal'
                ? 'border-[#10284D] text-[#10284D]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="CalendarIcon" size={15} />
            <span>Jadwal Pengingat</span>
          </button>
        </div>

        {/* Global Search Bar */}
        {(activeTab === 'care_plan' || activeTab === 'panduan') && (
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'care_plan'
                  ? 'Cari nama baju, bahan, atau kondisi...'
                  : 'Cari panduan cuci, noda, setrika...'
              }
              className="w-full bg-card border border-border rounded-2xl pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CARE PLAN & RIWAYAT SCAN BAJU */}
        {/* ========================================================================= */}
        {activeTab === 'care_plan' && (
          <div className="space-y-3.5">
            {/* Category Filter Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Kategori Pakaian:</span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Menampilkan {filteredGarments.length} dari {garments.length} pakaian
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {garmentCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategoryFilter === cat
                        ? 'bg-[#10284D] text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              <span className="text-[10px] font-bold text-muted-foreground pr-1">Status:</span>
              {statusOptions.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    selectedStatusFilter === st
                      ? 'bg-secondary text-primary border border-primary/30'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Empty State */}
            {filteredGarments.length === 0 && (
              <div className="bg-card rounded-3xl p-8 border border-border text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-xl">
                  🔍
                </div>
                <h4 className="text-xs font-bold text-foreground">Tidak Ada Pakaian Ditemukan</h4>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Coba sesuaikan kata kunci pencarian atau ganti filter kategori/status di atas.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('Semua');
                    setSelectedStatusFilter('Semua');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}

            {/* List Cards */}
            {filteredGarments.map((garment) => {
              const completedCount = garment.careSteps.filter((s) => s.done).length;
              const totalCount = garment.careSteps.length;
              const percentDone = Math.round((completedCount / totalCount) * 100);

              return (
                <div
                  key={garment.id}
                  onClick={() => setSelectedGarment(garment)}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                        <span>{garment.iconText}</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-foreground">{garment.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {garment.category} • Scanned: {garment.scanDate}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        garment.statusBadge === 'Baik'
                          ? 'bg-[#D1FAE5] text-[#166534]'
                          : garment.statusBadge === 'Perlu Perawatan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {garment.statusBadge} ({garment.score}/100)
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {garment.summary}
                  </p>

                  {/* Progress Checklist Bar */}
                  <div className="space-y-1.5 bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-foreground/80">
                        Checklist Perawatan ({completedCount}/{totalCount} Selesai)
                      </span>
                      <span className="text-emerald-600 font-extrabold">{percentDone}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentDone}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground pt-1 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">
                      Bahan: <strong className="text-foreground">{garment.fabric}</strong>
                    </span>
                    <span className="text-primary font-bold hover:underline flex items-center gap-1">
                      Buka Detail <Icon name="ChevronRightIcon" size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PANDUAN RAWAT MANDIRI */}
        {/* ========================================================================= */}
        {activeTab === 'panduan' && (
          <div className="space-y-3.5">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{guide.icon}</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-foreground">{guide.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{guide.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[9px] bg-secondary text-primary font-extrabold px-2 py-0.5 rounded-md">
                      {guide.category}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      ⏱️ {guide.timeEst}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-3 space-y-2 border border-border">
                  {guide.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                      <span className="text-[#10284D] font-bold min-w-[16px]">{idx + 1}.</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                  <span>Tingkat: <strong className="text-foreground">{guide.difficulty}</strong></span>
                  <button
                    onClick={() => toast.success(`Panduan "${guide.title}" disimpan ke favorit!`)}
                    className="text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <span>⭐</span>
                    <span>Simpan Panduan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KARAKTER SERAT KAIN */}
        {/* ========================================================================= */}
        {activeTab === 'kain' && (
          <div className="space-y-3">
            <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border overflow-hidden">
              {fabricKnowledge.map((fabric, idx) => (
                <div key={idx} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{fabric.icon}</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-foreground">{fabric.name}</h4>
                        <span className="text-[10px] text-muted-foreground">
                          Setrika: {fabric.ironTemp}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-secondary text-primary font-bold px-2 py-1 rounded-lg">
                      Suhu Cuci: {fabric.temp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                    {fabric.care}
                  </p>
                  <div className="ml-9 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2 text-[11px] flex items-center gap-2">
                    <span>💡</span>
                    <span><strong>Tips Khusus:</strong> {fabric.tips}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ECO-CALCULATOR & KINDFOAM */}
        {/* ========================================================================= */}
        {activeTab === 'kalkulator' && (
          <div className="space-y-4">
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-2xl">
                  🧼
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    Kalkulator Dosis Eco-Deterjen Kindfoam
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Hitung lembaran deterjen & dampak penghematan air cucianmu
                  </p>
                </div>
              </div>

              {/* Slider Input Berat Cucian */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Berat / Beban Cucian:</span>
                  <span className="text-base font-extrabold text-[#10284D] bg-secondary px-3 py-0.5 rounded-full">
                    {loadWeightKg} kg (~{loadWeightKg * 4} helai pakaian)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={loadWeightKg}
                  onChange={(e) => setLoadWeightKg(Number(e.target.value))}
                  className="w-full accent-[#10284D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold px-1">
                  <span>1 kg (Sedikit)</span>
                  <span>6 kg (Keluarga)</span>
                  <span>12 kg (Banyak)</span>
                </div>
              </div>

              {/* Hasil Kalkulasi Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">
                    Dosis Kindfoam
                  </span>
                  <span className="text-xl font-black text-[#10284D] block">
                    {kindfoamSheets} Lembar
                  </span>
                  <span className="text-[10px] text-blue-600">
                    Cukup larutkan langsung dalam tabung
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
                    Air Yang Dihemat
                  </span>
                  <span className="text-xl font-black text-emerald-800 block">
                    💧 {waterSavedLiters} Liter
                  </span>
                  <span className="text-[10px] text-emerald-600">
                    Bebas busa kimia berlebih
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
                    Emisi Karbon Dicegah
                  </span>
                  <span className="text-base font-extrabold text-amber-900 block">
                    🌿 {carbonSavedGrams} g CO2e
                  </span>
                  <span className="text-[10px] text-amber-700">
                    Beban distribusi 80% lebih ringan
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-700 font-bold block uppercase tracking-wider">
                    Estimasi Biaya
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block">
                    Rp {costEstimateRupiah.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Rp 1.800 / lembar cuci
                  </span>
                </div>
              </div>

              {/* Promo Banner CTA Kindfoam */}
              <div className="bg-gradient-to-r from-[#0F3875] to-[#1E5FA8] text-white rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] bg-cyan-400/30 text-cyan-200 font-bold px-2 py-0.5 rounded">
                    Official Product
                  </span>
                  <h4 className="text-xs font-extrabold">Kindfoam Eco Detergent Sheet</h4>
                  <p className="text-[10px] text-white/80">Tersedia di Market Klámbi (Pack isi 30 lembar)</p>
                </div>
                <button
                  onClick={() => router.push('/trift-marketplace')}
                  className="bg-white text-[#10284D] px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
                >
                  Beli di Market →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: JADWAL PENGINGAT PERAWATAN */}
        {/* ========================================================================= */}
        {activeTab === 'jadwal' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Jadwal Perawatan Terjadwal</span>
              <button
                onClick={() => toast.info('Fitur sinkronisasi kalender HP segera hadir!')}
                className="text-xs text-primary font-bold hover:underline"
              >
                + Tambah Jadwal
              </button>
            </div>

            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                    <span>{sch.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-foreground">{sch.title}</h4>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                        {sch.dateBadge}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {sch.category} • Frekuensi: {sch.frequency}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleSchedule(sch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sch.isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {sch.isActive ? '🔔 Aktif' : '🔕 Mati'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL DETAIL CARE PLAN & CHECKLIST INTERAKTIF */}
        {/* ========================================================================= */}
        {selectedGarment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 max-h-[85vh] overflow-y-auto animate-scale-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedGarment.iconText}</span>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                      {selectedGarment.title}
                    </h3>
                    <p className="text-xs text-gray-500">Diagnosis AI • {selectedGarment.scanDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGarment(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              {/* Score & Material */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-gray-500 block text-[10px]">Skor Kondisi</span>
                  <span className="font-extrabold text-sm text-[#10284D]">
                    {selectedGarment.score} / 100
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-gray-500 block text-[10px]">Komposisi Bahan</span>
                  <span className="font-bold text-xs text-gray-800 truncate block">
                    {selectedGarment.fabric}
                  </span>
                </div>
              </div>

              {/* Diagnosis Parameters */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-800 block">Detail Parameter AI:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-gray-400 block text-[9px]">Kebersihan</span>
                    <span className="font-semibold text-gray-700">{selectedGarment.parameters.cleanliness}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-gray-400 block text-[9px]">Kelunturan</span>
                    <span className="font-semibold text-gray-700">{selectedGarment.parameters.fading}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-gray-400 block text-[9px]">Kondisi Serat</span>
                    <span className="font-semibold text-gray-700">{selectedGarment.parameters.fiber}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-gray-400 block text-[9px]">Kerusakan</span>
                    <span className="font-semibold text-gray-700">{selectedGarment.parameters.damage}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Care Steps Checklist */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">Checklist Langkah Perawatan:</span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {selectedGarment.careSteps.filter((s) => s.done).length} / {selectedGarment.careSteps.length} selesai
                  </span>
                </div>
                <div className="space-y-1.5">
                  {selectedGarment.careSteps.map((step, i) => (
                    <div
                      key={i}
                      onClick={() => toggleStepDone(selectedGarment.id, i)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        step.done
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 line-through opacity-80'
                          : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={step.done}
                        onChange={() => {}}
                        className="w-4 h-4 mt-0.5 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span className="text-xs leading-relaxed">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rekomendasi Aksi */}
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-blue-900">
                <span className="font-bold block mb-0.5">Kesimpulan & Solusi AI:</span>
                <p>{selectedGarment.recommendationAction}</p>
              </div>

              {/* Action Buttons: Rawat Sendiri vs Gunakan Jasa */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    toast.success('Panduan rawat mandiri siap diterapkan!');
                    setSelectedGarment(null);
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
                >
                  ✨ Rawat Sendiri
                </button>

                <button
                  onClick={() => {
                    setSelectedGarment(null);
                    router.push('/menu-perawatan');
                  }}
                  className="border-2 border-[#10284D] text-[#10284D] py-3 rounded-2xl text-xs font-bold hover:bg-secondary active:scale-95 transition-all"
                >
                  🔍 Gunakan Jasa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
