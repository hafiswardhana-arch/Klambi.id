/**
 * Types & Interfaces for Wearwise AI Garment Condition Assessment System
 * Based on 7 Diagnosis Dimensions & 5 Circular Decision Categories
 */

export type DimensionRating = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
export type SeverityLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'critical';

export interface AssessmentDimension {
  id: string;
  name: string;
  score: number; // 1 - 5
  rating: DimensionRating;
  severity: SeverityLevel;
  findings: string[];
  details: string;
}

export type CircularActionCategory =
  | 'CIRCULATE'  // A. Ready to Circulate (Layak Jual / Thrift)
  | 'CARE'       // B. Care Required (Laundry, Noda, Spa)
  | 'ALTER'      // C. Alteration Required (Permak, Jahit, Kancing/Resleting)
  | 'UPCYCLE'    // D. Upcycling Potential (Rework, Redesign, Kiloan)
  | 'RECOVERY';  // E. Material Recovery (Pemulihan & Daur Ulang Serat)

export interface GarmentVisualProfile {
  dominantR: number;
  dominantG: number;
  dominantB: number;
  hueDeg: number;
  satPct: number;
  lumPct: number;
  contrastPct: number;
  colorName: string;
  likelyFabric: string;
  garmentType: string;
  category: string;
}

export interface UserContextInput {
  odour?: 'none' | 'musty' | 'strong'; // Bau: Bersih / Apek / Bau Menyengat
  knownFabric?: string;               // Bahan jika diketahui: Katun, Denim, Poliester, dll.
  usageHistory?: string;              // Riwayat pemakaian: Harian, Jarang, Sering cuci panas, dll.
  notes?: string;                     // Catatan tambahan pengguna
  visualProfile?: GarmentVisualProfile; // Ekstraksi profil visual piksel langsung dari kamera
}

export interface GarmentAssessmentResult {
  isGarmentDetected: boolean;
  confidence: number;
  focusGuidance?: string; // Panduan memfokuskan kamera & meratakan posisi jika tidak terdeteksi
  
  // Garment Identity
  garmentType: string;    // Kaus, Kemeja, Jeans, Jaket, Dress, dll.
  category: string;       // Atasan / Bawahan / Outerwear / dsb.
  estimatedFabric: string;// Katun Organik, Denim Twill, Poliester, dll.
  colorSummary: string;   // Putih, Hitam, Sage Green, dll.
  
  // 7 Dimensions of Assessment
  dimensions: {
    cleanliness: AssessmentDimension;       // 1. Kebersihan
    physicalIntegrity: AssessmentDimension; // 2. Integritas Fisik
    colorCondition: AssessmentDimension;    // 3. Kondisi Warna
    fabricSurface: AssessmentDimension;     // 4. Kualitas Permukaan Kain
    shapeStructure: AssessmentDimension;    // 5. Bentuk dan Struktur
    durability: AssessmentDimension;        // 6. Kekuatan Material
    componentCondition: AssessmentDimension;// 7. Kondisi Komponen
  };

  // Garment Condition Score (GCS): 20 - 100
  gcsScore: number;
  conditionGrade: 'Grade A+' | 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D';
  conditionStatus: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Kritis';
  
  // AI Decision Engine (5 Categories)
  primaryAction: CircularActionCategory;
  actionTitle: string;
  actionBadge: string;
  actionReason: string;
  recommendedService: string;
  targetHref: string;
  estimatedPriceRange?: string;

  // Key visual defect summary
  defectsSummary: string[];
}

// Default dimension weights for GCS calculation (Total = 1.0)
export const DIMENSION_WEIGHTS = {
  physicalIntegrity: 0.20,
  cleanliness: 0.15,
  colorCondition: 0.15,
  fabricSurface: 0.15,
  shapeStructure: 0.15,
  durability: 0.10,
  componentCondition: 0.10,
} as const;

/**
 * Calculates GCS (Garment Condition Score) on a 0-100 scale:
 * sum(weight_i * score_i) * 20 (since score is 1-5, 5*20 = 100)
 */
export function calculateGCS(dimensions: GarmentAssessmentResult['dimensions']): number {
  const sum =
    dimensions.physicalIntegrity.score * DIMENSION_WEIGHTS.physicalIntegrity +
    dimensions.cleanliness.score * DIMENSION_WEIGHTS.cleanliness +
    dimensions.colorCondition.score * DIMENSION_WEIGHTS.colorCondition +
    dimensions.fabricSurface.score * DIMENSION_WEIGHTS.fabricSurface +
    dimensions.shapeStructure.score * DIMENSION_WEIGHTS.shapeStructure +
    dimensions.durability.score * DIMENSION_WEIGHTS.durability +
    dimensions.componentCondition.score * DIMENSION_WEIGHTS.componentCondition;

  return Math.min(100, Math.max(20, Math.round(sum * 20)));
}
