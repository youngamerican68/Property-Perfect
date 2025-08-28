import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase-client'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, prompt, preset } = body

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Check user's credit balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', user.id)
      .single()

    if (userError) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ id: user.id, email: user.email, credit_balance: 3 }])
        .select('credit_balance')
        .single()
      
      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'User setup failed' }, { status: 500 })
      }
      
      if ((newUser?.credit_balance || 0) < 1) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
      }
    } else if ((userData?.credit_balance || 0) < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // Create job record
    const { data: jobData, error: jobError } = await supabase
      .from('enhancement_jobs')
      .insert([{
        user_id: user.id,
        status: 'processing',
        original_image_url: imageUrl,
        prompt: prompt || getPresetPrompt(preset),
        preset: preset,
        credits_used: 1
      }])
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    // Deduct credit
    const { error: creditError } = await supabase
      .from('users')
      .update({ 
        credit_balance: supabase.raw('credit_balance - 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (creditError) {
      console.error('Error deducting credit:', creditError)
      // Rollback job creation
      await supabase.from('enhancement_jobs').delete().eq('id', jobData.id)
      return NextResponse.json({ error: 'Credit deduction failed' }, { status: 500 })
    }

    try {
      // Process with Gemini AI
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      // Convert image URL to base64 for Gemini
      const imageResponse = await fetch(imageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const imageBase64 = Buffer.from(imageBuffer).toString('base64')
      
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: imageResponse.headers.get('content-type') || 'image/jpeg'
        }
      }

      const enhancementPrompt = `${prompt || getPresetPrompt(preset)}. Please analyze this property image and provide detailed enhancement suggestions. Focus on improving visual appeal for real estate marketing while maintaining realism.`

      const result = await model.generateContent([enhancementPrompt, imagePart])
      const enhancementSuggestions = result.response.text()

      // Update job with completion (in a real app, you'd process the image and upload)
      const completedAt = new Date().toISOString()
      const { error: updateError } = await supabase
        .from('enhancement_jobs')
        .update({
          status: 'completed',
          enhanced_image_url: imageUrl, // For now, return original image
          completed_at: completedAt,
          processing_time: '00:00:30' // Mock processing time
        })
        .eq('id', jobData.id)

      if (updateError) {
        console.error('Error updating job:', updateError)
      }

      return NextResponse.json({
        jobId: jobData.id,
        status: 'completed',
        originalImageUrl: imageUrl,
        enhancedImageUrl: imageUrl, // In production, this would be the enhanced image
        enhancementSuggestions,
        prompt: prompt || getPresetPrompt(preset),
        processingTime: '30s',
        creditsUsed: 1,
        createdAt: jobData.created_at,
        completedAt
      }, { status: 200 })

    } catch (aiError) {
      console.error('AI processing error:', aiError)
      
      // Update job status to failed
      await supabase
        .from('enhancement_jobs')
        .update({
          status: 'failed',
          error_message: 'AI processing failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobData.id)

      return NextResponse.json({
        error: 'Enhancement processing failed',
        message: 'AI service temporarily unavailable'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Enhancement API error:', error)
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to process image enhancement'
    }, { status: 500 })
  }
}

// TODO: Move to separate utils file
function getPresetPrompt(preset: string): string {
  const presets: Record<string, string> = {
    'declutter': 'Remove all unwanted objects, clutter, and personal items from this property photo while maintaining natural lighting and proportions',
    'virtual-staging': 'Add modern, tasteful furniture and decor to this empty space to make it more appealing to potential buyers',
    'enhance': 'Improve the lighting, colors, and overall quality of this property photo to make it more professional and attractive',
    'repair': 'Fix any visible damage, stains, or imperfections in this property photo while keeping it realistic',
  }

  return presets[preset] || 'Enhance this property photo to make it more appealing and professional'
}

// TODO: Implement GET endpoint for retrieving job status
// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url)
//   const jobId = searchParams.get('jobId')
//   
//   if (!jobId) {
//     return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
//   }
//
//   // TODO: Fetch job from database
//   // TODO: Return job status and results
// }