import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase-client'

// Use OpenRouter instead of Google directly to avoid quota issues
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check if API is disabled for emergency cost control
    if (process.env.DISABLE_AI_API === 'true') {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable',
        message: 'Image enhancement is temporarily disabled for maintenance' 
      }, { status: 503 })
    }

    // Get user from auth header (allow test mode)
    const authHeader = request.headers.get('authorization')
    let user: any = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      // Allow test token for development
      if (token === 'test-token') {
        user = {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      } else {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !authUser) {
          return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
        }
        user = authUser
      }
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, prompt, preset } = body

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Skip database checks for test mode
    if (user.id === 'test-user-id') {
      console.log('Test mode: bypassing database checks')
    } else {
      // Check daily usage limits (only for real users)
      const today = new Date().toISOString().split('T')[0]
      
      // Check user daily limit (10 per day)
      const { data: userDailyUsage, error: userUsageError } = await supabase
        .from('enhancement_jobs')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
      
      if (userUsageError) {
        console.error('Error checking user daily usage:', userUsageError)
      } else if ((userDailyUsage?.length || 0) >= 10) {
        return NextResponse.json({ 
          error: 'Daily limit reached',
          message: 'You have reached your daily limit of 10 enhancements. Please try again tomorrow.' 
        }, { status: 429 })
      }
      
      // Check application-wide daily limit (50 per day)
      const { data: totalDailyUsage, error: totalUsageError } = await supabase
        .from('enhancement_jobs')
        .select('id')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
      
      if (totalUsageError) {
        console.error('Error checking total daily usage:', totalUsageError)
      } else if ((totalDailyUsage?.length || 0) >= 50) {
        return NextResponse.json({ 
          error: 'Service capacity reached',
          message: 'Daily enhancement limit reached. Service will resume tomorrow.' 
        }, { status: 503 })
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
          .insert([{ id: user.id, email: user.email, credit_balance: 1 }])
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
    }

    // Create job record (skip for test mode)
    let jobData: any = null
    
    if (user.id === 'test-user-id') {
      jobData = {
        id: 'test-job-id',
        created_at: new Date().toISOString()
      }
      console.log('Test mode: skipping job creation and credit deduction')
    } else {
      const { data: createdJob, error: jobError } = await supabase
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
      
      jobData = createdJob

      // Deduct credit - first get current balance, then subtract 1
      const { data: currentUser } = await supabase
        .from('users')
        .select('credit_balance')
        .eq('id', user.id)
        .single()
      
      const { error: creditError } = await supabase
        .from('users')
        .update({ 
          credit_balance: (currentUser?.credit_balance || 0) - 1
        })
        .eq('id', user.id)

      if (creditError) {
        console.error('Error deducting credit:', creditError)
        // Rollback job creation
        await supabase.from('enhancement_jobs').delete().eq('id', jobData.id)
        return NextResponse.json({ error: 'Credit deduction failed' }, { status: 500 })
      }
    }

    try {
      // Process with Gemini 2.5 Flash Image via OpenRouter
      const enhancementPrompt = `Edit this image: ${prompt || getPresetPrompt(preset)}. IMPORTANT: You must generate and return a visually modified version of this image, not just describe what you would do. Actually edit the image to apply the lighting and enhancement changes requested.`

      // Use direct Google Gemini API for image editing since OpenRouter doesn't support it properly  
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent', {
        method: 'POST',
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: imageUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
                  data: imageUrl.split(',')[1] // Remove data:image/type;base64, prefix
                }
              },
              { text: enhancementPrompt }
            ]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // Extract the generated image from Google Gemini API response
      const candidate = result.candidates?.[0]
      if (!candidate) {
        throw new Error('No candidate response from Gemini API')
      }

      let textResponse = 'Image enhancement completed'
      let enhancedImageDataUrl = null

      // Look for image parts in the response
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          textResponse = part.text
        } else if (part.inline_data) {
          // Convert inline data to data URL
          const mimeType = part.inline_data.mime_type || 'image/png'
          enhancedImageDataUrl = `data:${mimeType};base64,${part.inline_data.data}`
        }
      }

      if (!enhancedImageDataUrl) {
        throw new Error('No enhanced image generated by Gemini API')
      }

      console.log('Enhancement successful! Generated image size:', enhancedImageDataUrl.length, 'characters')
      
      // Update job with completion (skip for test mode)
      const completedAt = new Date().toISOString()
      if (user.id !== 'test-user-id') {
        const { error: updateError } = await supabase
          .from('enhancement_jobs')
          .update({
            status: 'completed',
            enhanced_image_url: enhancedImageDataUrl,
            completed_at: completedAt,
            processing_time: '00:01:00'
          })
          .eq('id', jobData.id)

        if (updateError) {
          console.error('Error updating job:', updateError)
        }
      }

      return NextResponse.json({
        jobId: jobData.id,
        status: 'completed',
        originalImageUrl: imageUrl,
        enhancedImageUrl: enhancedImageDataUrl,
        prompt: prompt || getPresetPrompt(preset),
        processingTime: '60s',
        creditsUsed: 1,
        createdAt: jobData.created_at,
        completedAt,
        openRouterResponse: textResponse // Include the text response
      }, { status: 200 })

    } catch (aiError) {
      console.error('AI processing error:', aiError)
      
      // Update job status to failed (skip for test mode)
      if (user.id !== 'test-user-id') {
        await supabase
          .from('enhancement_jobs')
          .update({
            status: 'failed',
            error_message: 'AI processing failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', jobData.id)
      }

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
    // Enhancement presets
    'declutter': 'Remove all unwanted objects, clutter, and personal items from this property photo while maintaining natural lighting and proportions',
    'virtual-staging': 'Add modern, tasteful furniture and decor to this empty space to make it more appealing to potential buyers',
    'enhance': 'Improve the lighting, colors, and overall quality of this property photo to make it more professional and attractive',
    'repair': 'Fix any visible damage, stains, or imperfections in this property photo while keeping it realistic',
    
    // LightLab relighting presets
    'golden-hour': 'Transform this property photo to have warm, dramatic golden hour lighting with soft shadows and golden tones, as if shot during sunset/sunrise. Maintain all structural elements and décor while only changing the lighting and ambiance',
    'soft-overcast': 'Relight this property photo with soft, even overcast lighting that eliminates harsh shadows and provides flattering, natural daylight. Keep all geometry and furnishings intact while optimizing the lighting conditions',
    'bright-daylight': 'Transform the lighting in this property photo to crisp, clean bright daylight with excellent visibility and vibrant colors. Maintain the exact same composition and elements while upgrading to perfect daytime lighting',
    'cozy-evening': 'Relight this property photo with warm, cozy evening interior lighting including warm lamp light and ambient lighting that creates an inviting atmosphere. Preserve all structural and decorative elements while enhancing the warmth and comfort'
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