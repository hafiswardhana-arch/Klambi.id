import { NextRequest, NextResponse } from 'next/server';
import { assessGarmentCondition } from '@/lib/ai/garmentAssessment';
import { UserContextInput } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, userContext } = body as {
      imageBase64: string;
      userContext?: UserContextInput;
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

    const assessmentResult = await assessGarmentCondition(imageBase64, userContext);

    return NextResponse.json({
      success: true,
      data: assessmentResult,
    });
  } catch (error) {
    console.error('API Error in /api/ai/scan-garment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat memproses diagnosis pakaian.',
      },
      { status: 500 }
    );
  }
}
