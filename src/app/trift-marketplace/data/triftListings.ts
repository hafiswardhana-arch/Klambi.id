export interface TriftListing {
  id: string;
  title: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  price: number;
  originalPrice: number;
  aiScore: number;
  conditionLabel: string;
  aiDescription: string;
  imageUrl: string;
  imageAlt: string;
  seller: {
    name: string;
    rating: number;
    totalSales: number;
    location: string;
    avatar: string;
  };
  listedAt: string;
  tags: string[];
  isVerified: boolean;
}

export const triftListings: TriftListing[] = [
{
  id: 'trift-001',
  title: 'Kemeja Flanel Kotak-kotak Merah',
  brand: 'H&M',
  category: 'Kemeja',
  size: 'M',
  color: 'Merah-Hitam',
  price: 65000,
  originalPrice: 299000,
  aiScore: 84,
  conditionLabel: 'Sangat Baik',
  aiDescription: 'Kemeja flanel dengan kondisi kain sangat baik. Warna merah-hitam masih cerah dan rata. Jahitan rapi di semua sisi. Kancing lengkap dan berfungsi. Tidak ada noda atau robekan.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6b1c55e-1781244937110.png",
  imageAlt: 'Kemeja flanel kotak-kotak warna merah hitam terbentang rata',
  seller: { name: 'Rini Anggraini', rating: 4.9, totalSales: 47, location: 'Bandung', avatar: 'RA' },
  listedAt: '2026-08-12',
  tags: ['flanel', 'casual', 'unisex'],
  isVerified: true
},
{
  id: 'trift-002',
  title: 'Celana Jeans Slim Fit Navy',
  brand: 'Levi\'s',
  category: 'Celana',
  size: '30',
  color: 'Navy Blue',
  price: 120000,
  originalPrice: 650000,
  aiScore: 76,
  conditionLabel: 'Cukup Baik',
  aiDescription: 'Jeans slim fit dengan bahan denim tebal. Ada sedikit fading di area lutut yang menambah karakter vintage. Jahitan masih kuat. Kancing dan resleting berfungsi normal.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_128caa93c-1772453083512.png",
  imageAlt: 'Celana jeans slim fit warna navy biru terbentang di permukaan putih',
  seller: { name: 'Dimas Pratama', rating: 4.7, totalSales: 23, location: 'Jakarta Selatan', avatar: 'DP' },
  listedAt: '2026-08-11',
  tags: ['jeans', 'slim-fit', 'denim'],
  isVerified: true
},
{
  id: 'trift-003',
  title: 'Dress Midi Batik Kontemporer',
  brand: 'Danar Hadi',
  category: 'Dress',
  size: 'S',
  color: 'Coklat-Krem',
  price: 95000,
  originalPrice: 450000,
  aiScore: 88,
  conditionLabel: 'Sangat Baik',
  aiDescription: 'Dress midi batik motif kontemporer dengan kondisi prima. Kain katun halus tanpa kusut. Motif batik cerah dan tidak pudar. Jahitan rapi termasuk di bagian pinggang dan hem.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1ccb24a94-1784966169507.png",
  imageAlt: 'Dress midi batik coklat krem dengan motif kontemporer',
  seller: { name: 'Siti Nuraini', rating: 5.0, totalSales: 89, location: 'Solo', avatar: 'SN' },
  listedAt: '2026-08-13',
  tags: ['batik', 'midi', 'formal-casual'],
  isVerified: true
},
{
  id: 'trift-004',
  title: 'Jaket Bomber Olive Green',
  brand: 'Uniqlo',
  category: 'Jaket',
  size: 'L',
  color: 'Olive Green',
  price: 150000,
  originalPrice: 799000,
  aiScore: 79,
  conditionLabel: 'Cukup Baik',
  aiDescription: 'Jaket bomber dengan bahan nylon berkualitas. Warna olive green sedikit memudar di area bahu namun masih terlihat bagus. Resleting berfungsi mulus. Tidak ada robekan.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_168864d5c-1774160693160.png",
  imageAlt: 'Jaket bomber warna olive green tergantung di hanger kayu',
  seller: { name: 'Fajar Nugroho', rating: 4.6, totalSales: 31, location: 'Yogyakarta', avatar: 'FN' },
  listedAt: '2026-08-10',
  tags: ['bomber', 'casual', 'streetwear'],
  isVerified: false
},
{
  id: 'trift-005',
  title: 'Kaos Oversized Putih Polos',
  brand: 'Cotton Ink',
  category: 'Kaos',
  size: 'XL',
  color: 'Putih',
  price: 35000,
  originalPrice: 175000,
  aiScore: 58,
  conditionLabel: 'Perlu Perhatian',
  aiDescription: 'Kaos oversized dengan bahan cotton combed. Ada beberapa noda kecil yang tidak terangkat di area dada. Warna putih sedikit kekuningan di area kerah. Jahitan masih kuat.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_19dd9b324-1785476498458.png",
  imageAlt: 'Kaos oversized putih polos terbentang di permukaan datar',
  seller: { name: 'Mega Wulandari', rating: 4.3, totalSales: 12, location: 'Surabaya', avatar: 'MW' },
  listedAt: '2026-08-09',
  tags: ['oversized', 'basic', 'casual'],
  isVerified: false
},
{
  id: 'trift-006',
  title: 'Kemeja Oxford Biru Muda',
  brand: 'Marks & Spencer',
  category: 'Kemeja',
  size: 'M',
  color: 'Biru Muda',
  price: 85000,
  originalPrice: 420000,
  aiScore: 91,
  conditionLabel: 'Sangat Baik',
  aiDescription: 'Kemeja oxford dengan bahan katun premium. Kondisi sangat baik mendekati baru. Warna biru muda cerah dan merata. Semua kancing lengkap dan jahitan sempurna di setiap sisi.',
  imageUrl: "https://images.unsplash.com/photo-1720239021870-ffecff7b4f48",
  imageAlt: 'Kemeja oxford biru muda tergantung rapi di hanger putih',
  seller: { name: 'Andika Saputra', rating: 4.8, totalSales: 56, location: 'Jakarta Pusat', avatar: 'AS' },
  listedAt: '2026-08-13',
  tags: ['oxford', 'formal', 'office'],
  isVerified: true
},
{
  id: 'trift-007',
  title: 'Celana Kulot Linen Abu-abu',
  brand: 'Zara',
  category: 'Celana',
  size: 'S',
  color: 'Abu-abu',
  price: 75000,
  originalPrice: 380000,
  aiScore: 82,
  conditionLabel: 'Sangat Baik',
  aiDescription: 'Celana kulot linen dengan drape yang bagus. Warna abu-abu netral masih bersih dan merata. Kain linen berkualitas tanpa kerutan permanen. Resleting tersembunyi berfungsi baik.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_11b7eb50c-1765885796299.png",
  imageAlt: 'Celana kulot linen warna abu-abu dengan potongan longgar',
  seller: { name: 'Laras Setiawati', rating: 4.9, totalSales: 38, location: 'Bandung', avatar: 'LS' },
  listedAt: '2026-08-12',
  tags: ['kulot', 'linen', 'minimalis'],
  isVerified: true
},
{
  id: 'trift-008',
  title: 'Dress Wrap Floral Musim Panas',
  brand: 'Mango',
  category: 'Dress',
  size: 'M',
  color: 'Kuning-Hijau',
  price: 110000,
  originalPrice: 550000,
  aiScore: 73,
  conditionLabel: 'Cukup Baik',
  aiDescription: 'Dress wrap dengan motif floral cerah. Warna kuning dan hijau masih vivid meski ada sedikit fading di bagian punggung. Tali pengikat pinggang masih utuh. Kain rayon lembut.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1aaa78644-1772209193987.png",
  imageAlt: 'Dress wrap bermotif bunga warna kuning hijau diletakkan di lantai kayu',
  seller: { name: 'Putri Handayani', rating: 4.5, totalSales: 19, location: 'Bali', avatar: 'PH' },
  listedAt: '2026-08-08',
  tags: ['wrap', 'floral', 'summer'],
  isVerified: true
},
{
  id: 'trift-009',
  title: 'Jaket Denim Klasik Biru Tua',
  brand: 'Wrangler',
  category: 'Jaket',
  size: 'L',
  color: 'Biru Tua',
  price: 180000,
  originalPrice: 850000,
  aiScore: 68,
  conditionLabel: 'Cukup Baik',
  aiDescription: 'Jaket denim klasik dengan karakter vintage yang kuat. Fading alami di area siku dan bahu menambah estetika. Jahitan masih kuat. Ada satu kancing yang perlu diganti.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_151cb9898-1772273307052.png",
  imageAlt: 'Jaket denim biru tua klasik dengan efek fading di siku',
  seller: { name: 'Rizky Ramadhan', rating: 4.4, totalSales: 28, location: 'Medan', avatar: 'RR' },
  listedAt: '2026-08-07',
  tags: ['denim', 'vintage', 'classic'],
  isVerified: false
},
{
  id: 'trift-010',
  title: 'Kaos Graphic Tee Band Vintage',
  brand: 'Unknown',
  category: 'Kaos',
  size: 'L',
  color: 'Hitam',
  price: 45000,
  originalPrice: 200000,
  aiScore: 62,
  conditionLabel: 'Cukup Baik',
  aiDescription: 'Kaos graphic tee dengan desain band vintage yang unik. Sablon sedikit retak di beberapa bagian namun masih terbaca jelas. Warna hitam dasar masih pekat. Bahan cotton tebal.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb10897c-1772159143899.png",
  imageAlt: 'Kaos hitam dengan graphic print band vintage terbentang rata',
  seller: { name: 'Bagas Wicaksono', rating: 4.2, totalSales: 8, location: 'Semarang', avatar: 'BW' },
  listedAt: '2026-08-06',
  tags: ['graphic', 'vintage', 'band-tee'],
  isVerified: false
},
{
  id: 'trift-011',
  title: 'Kemeja Batik Tulis Motif Parang',
  brand: 'Batik Keris',
  category: 'Kemeja',
  size: 'L',
  color: 'Coklat-Krem',
  price: 200000,
  originalPrice: 900000,
  aiScore: 93,
  conditionLabel: 'Sangat Baik',
  aiDescription: 'Kemeja batik tulis asli dengan motif parang yang halus. Kondisi hampir sempurna, hanya dipakai 2–3 kali. Warna coklat dan krem sangat kaya dan konsisten. Jahitan tangan rapi.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1ed81d396-1772370226249.png",
  imageAlt: 'Kemeja batik tulis motif parang coklat krem tergantung di hanger',
  seller: { name: 'Hendra Kusuma', rating: 5.0, totalSales: 102, location: 'Yogyakarta', avatar: 'HK' },
  listedAt: '2026-08-13',
  tags: ['batik-tulis', 'parang', 'formal'],
  isVerified: true
},
{
  id: 'trift-012',
  title: 'Celana Chino Krem Slim',
  brand: 'Pull & Bear',
  category: 'Celana',
  size: '32',
  color: 'Krem',
  price: 55000,
  originalPrice: 280000,
  aiScore: 71,
  conditionLabel: 'Cukup Baik',
  aiDescription: 'Celana chino slim fit warna krem. Ada sedikit noda kecil di bagian saku kiri yang tidak terlalu terlihat. Kain katun masih tebal dan tidak melar. Resleting dan kancing berfungsi baik.',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_128caa93c-1772453083512.png",
  imageAlt: 'Celana chino slim fit warna krem terlipat rapi di permukaan kayu',
  seller: { name: 'Yoga Pratama', rating: 4.3, totalSales: 15, location: 'Malang', avatar: 'YP' },
  listedAt: '2026-08-05',
  tags: ['chino', 'slim', 'casual'],
  isVerified: false
}];