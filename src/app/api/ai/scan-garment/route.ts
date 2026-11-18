import { NextRequest, NextResponse } from 'next/server';
import { assessGarmentCondition, GarmentAssessmentError } from '@/lib/ai/garmentAssessment';
import { UserContextInput, GarmentVisualProfile } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Vision analysis can take a while; allow up to 60s on Vercel.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, userContext, visualProfile } = body as {
      imageBase64: string;
      userContext?: UserContextInput;
      visualProfile?: GarmentVisualProfile;
    };

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Gambar pakaian wajib disertakan dalam format base64.',
        },
        { status: 400 }
      );
    }

    const mergedContext: UserContextInput = {
      ...(userContext || {}),
      visualProfile: visualProfile || userContext?.visualProfile,
    };

    const assessmentResult = await assessGarmentCondition(imageBase64, mergedContext);

    return NextResponse.json({
      success: true,
      data: assessmentResult,
    });
  } catch (error) {
    console.error('API Error in /api/ai/scan-garment:', error);
    if (error instanceof GarmentAssessmentError) {
      return NextResponse.json(
        { success: false, error: error.userMessage },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat memproses diagnosis pakaian.',
      },
      { status: 500 }
    );
  }
}
