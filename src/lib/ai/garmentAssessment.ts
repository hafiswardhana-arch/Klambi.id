import {
  GarmentAssessmentResult,
  UserContextInput,
  calculateGCS,
  CircularActionCategory,
  GarmentVisualProfile,
} from './types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
// Primary model is configurable; the second entry is a stable fallback.
const GEMINI_MODELS = Array.from(
  new Set([process.env.GEMINI_MODEL || 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])
);

/**
 * Error thrown when the AI assessment cannot be performed.
 * `userMessage` is safe to show in the UI (Indonesian).
 */
export class GarmentAssessmentError extends Error {
  constructor(
    public userMessage: string,
    public status: number = 502,
    detail?: string
  ) {
    super(detail || userMessage);
    this.name = 'GarmentAssessmentError';
  }
}

function getServerApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

/**
 * System prompt instructing Gemini Vision to assess the garment across:
 * - 7 Assessment Dimensions (1-5 score, severity, findings)
 * - Garment Condition Score (GCS)
 * - 5 Circular Action Categories (CIRCULATE, CARE, ALTER, UPCYCLE, RECOVERY)
 * - Camera focus & position validation
 */
const ASSESSMENT_SYSTEM_PROMPT = `
You are Wearwise AI, the authoritative Garment Condition Assessment & Circular Decision Engine for Klámbi.id.
Your task is to analyze garment images and determine the exact physical condition to extend the garment's lifecycle.

EVALUATION FRAMEWORK:
You must evaluate the garment across 7 primary dimensions (Score 1-5 scale):
- 5: Excellent (Kondisi sangat baik, prima)
- 4: Good (Kondisi baik, penurunan minimal)
- 3: Fair (Ada penurunan kondisi / noda atau keausan ringan)
- 2: Poor (Kerusakan atau noda cukup signifikan)
- 1: Critical (Kerusakan berat atau robek/rapuh luas)

THE 7 DIMENSIONS:
1. cleanliness (Kebersihan):
   - Stains (makanan, minyak, tinta, kotoran).
   - Odour assessment (combine with user input if provided).
   - Stain severity: none, light, moderate, heavy.
2. physicalIntegrity (Integritas Fisik):
   - Holes, tears, unraveling threads, ripped seams, broken buttons/zipper.
   - Severity: none, minor, moderate, severe.
3. colorCondition (Kondisi Warna):
   - Fading, discoloration, uneven fading, bleeding.
   - Severity: none, light, moderate, severe.
4. fabricSurface (Kualitas Permukaan Kain):
   - Pilling (serat menggumpal), abrasion, fraying, permanent creases, uneven texture.
   - Severity: none, light, moderate, heavy.
5. shapeStructure (Bentuk dan Struktur):
   - Stretched out (melar), shrinkage, deformed collar/cuffs, warped silhouette.
   - Severity: none, minor, moderate, severe.
6. durability (Kekuatan Material):
   - Thinning fabric, weakened fibers, wear-and-tear from repeated use, brittle fabric.
   - Severity: none, mild, moderate, critical.
7. componentCondition (Kondisi Komponen):
   - Missing/damaged buttons, jammed/broken zipper, worn-out elastic bands, loose accessories/labels.
   - Severity: none, minor, moderate, severe.

DECISION ENGINE (5 CIRCULAR CATEGORIES):
Map the overall findings to exactly ONE primary action:
- "CIRCULATE" (A. Ready to Circulate / Layak Jual): Pakaian bersih & terawat, tidak ada lubang/sobekan, warna baik, siap edar di Thrift Marketplace.
- "CARE" (B. Care Required / Perlu Perawatan): Pakaian bernoda, kusam, bau, atau kusut yang butuh cuci, deep cleaning, atau Kindfoam eco-detergent.
- "ALTER" (C. Alteration Required / Perlu Perbaikan): Kerusakan fisik yang masih ekonomis diperbaiki (jahit robekan, ganti kancing, servis resleting, potong/resize).
- "UPCYCLE" (D. Upcycling Potential / Potensi Transformasi): Kerusakan tersebar atau bentuk asli tidak optimal, tapi material masih bisa diolah/rework/dijual kiloan.
- "RECOVERY" (E. Material Recovery / Pemulihan Material): Kerusakan sangat berat, kain lapuk/rapuh luas, tidak ekonomis diperbaiki; disalurkan ke daur ulang serat industri.

GARMENT DETECTION (STRICT, CHECK THIS FIRST):
Set "isGarmentDetected": false when ANY of these is true:
- The main subject is a person (face, selfie, portrait, upper body) and the clothing is not the clear focus or fills less than about 40% of the frame.
- The image shows no clothing or textile item (room, wall, furniture, screen, document, food, animal, etc.).
- The image is too dark, overexposed, or blurry to judge fabric, stains, or seams.
When false, write "focusGuidance" in Indonesian that names what you actually see (for example "Foto menampilkan wajah/potret orang, bukan pakaian") and tells the user how to retake: lay the garment flat or hang it, fill the frame, use bright even light.
Set "isGarmentDetected": true ONLY when a garment is the clear main subject (laid flat, hanging, or worn with the garment fully visible and filling most of the frame).

HONESTY RULES:
- Base every score and finding only on what is visible in this photo. Never invent defects or praise you cannot see.
- If an area or component is not visible (e.g. back side, zipper, buttons), say so in "details" and give score 3 for that dimension.
- Scores must vary with the real condition; do not default to 5.

OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this exact schema:
{
  "isGarmentDetected": true | false,
  "confidence": number (0.0 to 1.0),
  "focusGuidance": string (if not detected),
  "garmentType": "Kaus" | "Kemeja" | "Celana Jeans" | "Jaket" | "Dress" | "Rok" | "Sweater" | string,
  "category": "Atasan" | "Bawahan" | "Outerwear" | "One-Piece",
  "estimatedFabric": string,
  "colorSummary": string,
  "dimensions": {
    "cleanliness": {
      "id": "cleanliness",
      "name": "Kebersihan",
      "score": number (1-5),
      "rating": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
      "severity": "none" | "light" | "moderate" | "heavy" | "critical",
      "findings": string[],
      "details": string in Indonesian
    },
    "physicalIntegrity": {
      "id": "physicalIntegrity",
      "name": "Integritas Fisik",
      "score": number (1-5),
      "rating": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
      "severity": "none" | "minor" | "moderate" | "severe",
      "findings": string[],
      "details": string in Indonesian
    },
    "colorCondition": {
      "id": "colorCondition",
      "name": "Kondisi Warna",
      "score": number (1-5),
      "rating": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
      "severity": "none" | "light" | "moderate" | "severe",
      "findings": string[],
      "details": string in Indonesian
    },
    "fabricSurface": {
      "id": "fabricSurface",
      "name": "Kualitas Permukaan Kain",
      "score": number (1-5),
      "rating": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
      "severity": "none" | "light" | "moderate" | "heavy",
      "findings": string[],
      "details": string in Indonesian
    },
    "shapeStructure": {
      "id": "shapeStructure",
      "name": "Bentuk & Struktur",
      "score": number (1-5),
      "rating": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
      "severity": "none" | "minor" | "moderate" | "severe",
      "findings": string[],
      "details": string in Indonesian
    },
    "durability": {
      "id": "durability",
      "name": "Kekuatan Material",
      "score": number (1-5),
      "rating": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
      "severity": "none" | "mild" | "moderate" | "critical",
      "findings": string[],
      "details": string in Indonesian
    },
    "componentCondition": {
      "id": "componentCondition",
      "name": "Kondisi Komponen",
      "score": number (1-5),
      "rating": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
      "severity": "none" | "minor" | "moderate" | "severe",
      "findings": string[],
      "details": string in Indonesian
    }
  },
  "primaryAction": "CIRCULATE" | "CARE" | "ALTER" | "UPCYCLE" | "RECOVERY",
  "actionTitle": string,
  "actionBadge": string,
  "actionReason": string in Indonesian,
  "recommendedService": string,
  "targetHref": string,
  "estimatedPriceRange": string,
  "defectsSummary": string[]
}
`;

/**
 * Perform AI Garment Condition Assessment via Google Gemini Vision.
 * Server-only: must be called from the API route so the key never reaches the browser.
 * Throws GarmentAssessmentError on failure (no silent fake results).
 */
export async function assessGarmentCondition(
  imageBase64: string,
  userContext?: UserContextInput
): Promise<GarmentAssessmentResult> {
  const activeKey = getServerApiKey();
  if (!activeKey) {
    throw new GarmentAssessmentError(
      'Layanan AI belum dikonfigurasi (GEMINI_API_KEY belum diatur di server).',
      503
    );
  }

  // Build user prompt combining image and optional user context
  let userTextPrompt = 'Nilai kondisi fisik pakaian ini secara komprehensif berdasarkan 7 dimensi diagnosis.';
  if (userContext) {
    const contextBits: string[] = [];
    if (userContext.odour) {
      const odourLabel =
        userContext.odour === 'none'
          ? 'Tidak ada bau apek/sedap'
          : userContext.odour === 'musty'
          ? 'Sedikit apek (memerlukan penyegaran)'
          : 'Bau menyengat/keringat membandel';
      contextBits.push(`Informasi bau dari pengguna: ${odourLabel}`);
    }
    if (userContext.knownFabric) {
      contextBits.push(`Bahan yang diketahui pengguna: ${userContext.knownFabric}`);
    }
    if (userContext.usageHistory) {
      contextBits.push(`Riwayat pemakaian: ${userContext.usageHistory}`);
    }
    if (userContext.notes) {
      contextBits.push(`Catatan tambahan: ${userContext.notes}`);
    }
    if (contextBits.length > 0) {
      userTextPrompt += `\nKonteks input pengguna:\n- ${contextBits.join('\n- ')}`;
    }
  }

  const { mimeType, data: imageData } = await toInlineImage(imageBase64);

  const buildBody = (model: string) => JSON.stringify({
    systemInstruction: { parts: [{ text: ASSESSMENT_SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: userTextPrompt }, { inline_data: { mime_type: mimeType, data: imageData } }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 8192,
      // A small thinking budget keeps answers careful but fast (~10s) so we stay under Vercel's 60s limit.
      ...(model.startsWith('gemini-2.5') ? { thinkingConfig: { thinkingBudget: model.includes('lite') ? 0 : 1024 } } : {}),
    },
  });

  let rawContent = '';
  let lastError = '';
  for (const model of GEMINI_MODELS) {
    let response: Response;
    try {
      response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': activeKey },
        body: buildBody(model),
        signal: AbortSignal.timeout(28_000),
      });
    } catch (error) {
      lastError = `network: ${String(error)}`;
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      lastError = `${model} ${response.status}: ${errorText.slice(0, 300)}`;
      // Bad key / bad request will not improve with another model.
      if (response.status === 400 || response.status === 401 || response.status === 403) break;
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json().catch(() => null);
    const parts = data?.candidates?.[0]?.content?.parts;
    rawContent = Array.isArray(parts)
      ? parts
          .filter((part: { text?: string; thought?: boolean }) => typeof part.text === 'string' && !part.thought)
          .map((part: { text: string }) => part.text)
          .join('')
      : '';
    if (rawContent) break;
    lastError = `${model}: empty response (${data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || 'unknown'})`;
  }

  if (!rawContent) {
    console.error('Gemini vision request failed:', lastError);
    throw new GarmentAssessmentError(
      'Analisis AI gagal diproses. Periksa koneksi lalu coba lagi beberapa saat.',
      502,
      lastError
    );
  }

  try {
    // Robust JSON extraction (strip codeblocks or surrounding text)
    let cleanJson = rawContent.trim();
    const codeBlockMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      cleanJson = codeBlockMatch[1].trim();
    } else {
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }
    }

    const parsed = JSON.parse(cleanJson);

    // If camera focus or garment not detected
    if (parsed.isGarmentDetected === false) {
      return {
        isGarmentDetected: false,
        confidence: parsed.confidence || 0.2,
        focusGuidance:
          parsed.focusGuidance ||
          'Pakaian tidak terdeteksi dengan jelas. Harap pastikan pencahayaan cukup, posisikan pakaian rata/terbentang penuh, dan fokuskan lensa kamera ke area pakaian.',
        garmentType: 'Tidak Teridentifikasi',
        category: 'Umum',
        estimatedFabric: 'Belum Terdeteksi',
        colorSummary: '-',
        dimensions: createEmptyDimensions(),
        gcsScore: 0,
        conditionGrade: 'Grade D',
        conditionStatus: 'Kritis',
        primaryAction: 'CARE',
        actionTitle: 'Perlu Pengambilan Ulang Foto',
        actionBadge: 'Fokuskan Kamera',
        actionReason: 'Kamera kurang fokus atau pakaian tidak berada di posisi yang optimal.',
        recommendedService: 'Ambil Ulang Foto Pakaian',
        targetHref: '/wearwise-ai',
        defectsSummary: ['Foto buram atau pakaian tidak terbentang dengan jelas'],
      };
    }

    // Sanitize dimensions to ensure none are missing or malformed
    const safeDimensions = sanitizeDimensions(parsed.dimensions);

    // Compute GCS
    const computedGCS = calculateGCS(safeDimensions);
    const grade =
      computedGCS >= 90
        ? 'Grade A+'
        : computedGCS >= 80
        ? 'Grade A'
        : computedGCS >= 65
        ? 'Grade B'
        : computedGCS >= 50
        ? 'Grade C'
        : 'Grade D';

    const status =
      computedGCS >= 85
        ? 'Sangat Baik'
        : computedGCS >= 70
        ? 'Baik'
        : computedGCS >= 55
        ? 'Cukup'
        : computedGCS >= 40
        ? 'Kurang'
        : 'Kritis';

    // Target route mapping per category
    const action = (parsed.primaryAction || 'CIRCULATE') as CircularActionCategory;
    const targetHref =
      action === 'CIRCULATE'
        ? '/jual/trif'
        : action === 'CARE'
        ? '/care-plan'
        : action === 'ALTER'
        ? '/menu-perawatan'
        : action === 'UPCYCLE'
        ? '/jual/trif'
        : '/jual/trif';

    return {
      isGarmentDetected: true,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
      garmentType: parsed.garmentType || 'Pakaian',
      category: parsed.category || 'Atasan',
      estimatedFabric: parsed.estimatedFabric || 'Kain Campuran',
      colorSummary: parsed.colorSummary || 'Warna Alami',
      dimensions: safeDimensions,
      gcsScore: computedGCS,
      conditionGrade: grade,
      conditionStatus: status,
      primaryAction: action,
      actionTitle: parsed.actionTitle || (action === 'CIRCULATE' ? 'Siap Edar' : 'Perlu Perawatan'),
      actionBadge: parsed.actionBadge || (action === 'CIRCULATE' ? 'Layak Jual' : 'Perawatan'),
      actionReason: parsed.actionReason || 'Analisis kondisi pakaian berhasil dilakukan oleh Wearwise AI.',
      recommendedService: parsed.recommendedService || 'Marketplace / Perawatan Klámbi',
      targetHref,
      estimatedPriceRange: parsed.estimatedPriceRange || 'Rp 50.000 – Rp 150.000',
      defectsSummary: Array.isArray(parsed.defectsSummary) ? parsed.defectsSummary : [],
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error, rawContent.slice(0, 300));
    throw new GarmentAssessmentError('Hasil analisis AI tidak dapat dibaca. Silakan coba lagi.', 502);
  }
}

/**
 * Normalize the client image (data URL, raw base64, or http URL) into Gemini inline data.
 */
async function toInlineImage(image: string): Promise<{ mimeType: string; data: string }> {
  if (image.startsWith('http')) {
    const res = await fetch(image, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
    if (!res || !res.ok) {
      throw new GarmentAssessmentError('Gambar contoh tidak dapat diunduh. Coba foto dari kamera atau galeri.', 400);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return { mimeType: res.headers.get('content-type') || 'image/jpeg', data: buffer.toString('base64') };
  }
  const match = image.match(/^data:(image\/[\w+.-]+);base64,([\s\S]*)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: 'image/jpeg', data: image };
}

/**
 * Classify visual characteristics from RGB and aspect ratio.
 */
export function classifyVisualProfile(
  r: number,
  g: number,
  b: number,
  aspectRatio: number = 1.0
): GarmentVisualProfile {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r / 255:
        h = (g / 255 - b / 255) / d + (g < b ? 6 : 0);
        break;
      case g / 255:
        h = (b / 255 - r / 255) / d + 2;
        break;
      case b / 255:
        h = (r / 255 - g / 255) / d + 4;
        break;
    }
    h /= 6;
  }
  const hueDeg = Math.round(h * 360);
  const satPct = Math.round(s * 100);
  const lumPct = Math.round(lum / 2.55);
  const contrastPct = Math.round(Math.abs(r - g) + Math.abs(g - b));

  let colorName = 'Warna Alami';
  let likelyFabric = 'Katun Campuran';
  let garmentType = 'Pakaian Kasual';
  let category = 'Atasan';

  if (lumPct < 22) {
    colorName = 'Hitam Pekat';
    likelyFabric = 'Katun Combed / Poliester Gelap';
    garmentType = aspectRatio < 0.85 ? 'Celana / Bawahan Hitam' : 'Kaus / Outerwear Hitam';
    category = aspectRatio < 0.85 ? 'Bawahan' : 'Atasan';
  } else if (lumPct > 80 && satPct < 18) {
    colorName = 'Putih Bersih / Putih Gading';
    likelyFabric = 'Katun Poplin / Rayon';
    garmentType = aspectRatio < 0.85 ? 'Celana Putih' : 'Kemeja / Kaus Putih';
    category = aspectRatio < 0.85 ? 'Bawahan' : 'Atasan';
  } else if (satPct < 18) {
    colorName = 'Abu-abu Misty';
    likelyFabric = 'Baby Terry / Katun Melange';
    garmentType = 'Sweater / Kaus Kasual';
    category = 'Atasan';
  } else if (hueDeg >= 185 && hueDeg <= 255) {
    colorName = 'Biru Indigo / Denim';
    likelyFabric = 'Denim Katun 13oz';
    garmentType = aspectRatio < 0.85 ? 'Celana Jeans Denim' : 'Jaket / Kemeja Denim';
    category = aspectRatio < 0.85 ? 'Bawahan' : 'Outerwear';
  } else if (hueDeg >= 340 || hueDeg <= 18) {
    colorName = 'Merah Marun / Koral';
    likelyFabric = 'Katun Combed 30s';
    garmentType = aspectRatio < 0.75 ? 'Dress Merah' : 'Kaus / Atasan Merah';
    category = aspectRatio < 0.75 ? 'One-Piece' : 'Atasan';
  } else if (hueDeg > 18 && hueDeg <= 48) {
    colorName = 'Khaki / Cokelat / Moka';
    likelyFabric = 'Katun Twill / Chino';
    garmentType = aspectRatio < 0.85 ? 'Celana Chino Khaki' : 'Kemeja / Jaket Khaki';
    category = aspectRatio < 0.85 ? 'Bawahan' : 'Atasan';
  } else if (hueDeg > 48 && hueDeg <= 75) {
    colorName = 'Kuning Mustard';
    likelyFabric = 'Katun Knit / Combed';
    garmentType = 'Kaus / Atasan Kuning';
    category = 'Atasan';
  } else if (hueDeg > 75 && hueDeg <= 170) {
    colorName = 'Hijau Sage / Olive';
    likelyFabric = 'Katun Linen / Ripstop';
    garmentType = 'Kemeja / Jaket Hijau';
    category = 'Atasan';
  } else {
    colorName = 'Ungu / Lilac / Magenta';
    likelyFabric = 'Katun Lembut / Rayon';
    garmentType = 'Kaus / Blus Kasual';
    category = 'Atasan';
  }

  return {
    dominantR: r,
    dominantG: g,
    dominantB: b,
    hueDeg,
    satPct,
    lumPct,
    contrastPct,
    colorName,
    likelyFabric,
    garmentType,
    category,
  };
}

// Helper to sanitize dimensions and avoid any missing keys
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeDimensions(rawDimensions: any): GarmentAssessmentResult['dimensions'] {
  const defaultDim = (id: string, name: string) => ({
    id,
    name,
    score: 4,
    rating: 'Good' as const,
    severity: 'none' as const,
    findings: ['Kondisi normal'],
    details: 'Kondisi komponen dan struktur dalam batas wajar.',
  });

  const getDim = (id: keyof GarmentAssessmentResult['dimensions'], name: string) => {
    const d = rawDimensions?.[id];
    if (!d) return defaultDim(id, name);
    const score = typeof d.score === 'number' ? Math.min(5, Math.max(1, Math.round(d.score))) : 3;
    return {
      id: d.id || id,
      name: d.name || name,
      score,
      rating: d.rating || (score >= 5 ? 'Excellent' : score >= 4 ? 'Good' : score >= 3 ? 'Fair' : score >= 2 ? 'Poor' : 'Critical'),
      severity: d.severity || 'none',
      findings: Array.isArray(d.findings) ? d.findings : [],
      details: typeof d.details === 'string' ? d.details : 'Kondisi baik.',
    };
  };

  return {
    cleanliness: getDim('cleanliness', 'Kebersihan'),
    physicalIntegrity: getDim('physicalIntegrity', 'Integritas Fisik'),
    colorCondition: getDim('colorCondition', 'Kondisi Warna'),
    fabricSurface: getDim('fabricSurface', 'Kualitas Permukaan Kain'),
    shapeStructure: getDim('shapeStructure', 'Bentuk & Struktur'),
    durability: getDim('durability', 'Kekuatan Material'),
    componentCondition: getDim('componentCondition', 'Kondisi Komponen'),
  };
}

function createEmptyDimensions(): GarmentAssessmentResult['dimensions'] {
  const dummyDim = (id: string, name: string) => ({
    id,
    name,
    score: 1,
    rating: 'Critical' as const,
    severity: 'critical' as const,
    findings: [],
    details: 'Tidak dapat dinilai karena foto tidak fokus.',
  });

  return {
    cleanliness: dummyDim('cleanliness', 'Kebersihan'),
    physicalIntegrity: dummyDim('physicalIntegrity', 'Integritas Fisik'),
    colorCondition: dummyDim('colorCondition', 'Kondisi Warna'),
    fabricSurface: dummyDim('fabricSurface', 'Kualitas Permukaan Kain'),
    shapeStructure: dummyDim('shapeStructure', 'Bentuk dan Struktur'),
    durability: dummyDim('durability', 'Kekuatan Material'),
    componentCondition: dummyDim('componentCondition', 'Kondisi Komponen'),
  };
}
