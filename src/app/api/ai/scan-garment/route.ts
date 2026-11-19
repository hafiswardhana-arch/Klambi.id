import { NextRequest, NextResponse } from 'next/server';
import { assessGarmentCondition, GarmentAssessmentError } from '@/lib/ai/garmentAssessment';
import { UserContextInput, GarmentVisualProfile } from '@/lib/ai/types';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/supabase/session';

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

    // Best-effort: save the result to the logged-in user's scan history (never blocks the response).
    try {
      const db = getSupabaseAdmin();
      const session = getSession(req);
      if (db && session && assessmentResult.isGarmentDetected !== false) {
        await db.from('garment_scans').insert({
          user_id: session.uid,
          garment_type: assessmentResult.garmentType,
          gcs_score: assessmentResult.gcsScore,
          condition_grade: assessmentResult.conditionGrade,
          primary_action: assessmentResult.primaryAction,
          result: assessmentResult,
        });
      }
    } catch (e) {
      console.error('Failed to save scan history:', e);
    }

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
