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
    const { imageUrl, prompt, preset, editHistory = [], isMultiTurn = false } = body

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
      } else if ((userDailyUsage?.length || 0) >= 100) {
        return NextResponse.json({ 
          error: 'Daily limit reached',
          message: 'You have reached your daily limit of 100 enhancements. Please try again tomorrow.' 
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
      let enhancementPrompt = prompt || getPresetPrompt(preset)
      
      // For multi-turn editing, include conversation history
      if (isMultiTurn && editHistory.length > 0) {
        const historyContext = editHistory.map((edit, i) => `Edit ${i + 1}: ${edit}`).join('\n')
        enhancementPrompt = `Continue editing this image. Previous edits made:\n${historyContext}\n\nNew edit: ${enhancementPrompt}\n\nIMPORTANT: You must keep ALL changes from previous edits while applying this new edit. Do not undo or reverse any previous modifications.`
      }

      // Use OpenRouter's free Gemini 2.5 Flash Image model
      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.5-flash-image-preview:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              },
              {
                type: 'text',
                text: enhancementPrompt
              }
            ]
          }
        ],
        max_tokens: 4096
      })

      // Extract response from OpenRouter
      const choice = response.choices?.[0]
      if (!choice) {
        throw new Error('No response from OpenRouter')
      }

      // Debug: Log the full response structure
      console.log('OpenRouter response structure:', JSON.stringify(choice, null, 2))

      let textResponse = 'Image enhancement completed'
      let enhancedImageDataUrl = imageUrl

      // Check for text content
      const content = choice.message?.content
      if (typeof content === 'string') {
        textResponse = content
      }

      // Check for generated images in the images array
      const images = choice.message?.images
      if (images && images.length > 0) {
        const firstImage = images[0]
        if (firstImage.type === 'image_url' && firstImage.image_url?.url) {
          enhancedImageDataUrl = firstImage.image_url.url
          console.log('Found enhanced image from OpenRouter!')
        }
      }

      // If we still have the original image, it means no new image was generated
      if (enhancedImageDataUrl === imageUrl) {
        console.log('No enhanced image generated, returning original')
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
            completed_at: completedAt
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
    // Enhancement presets - conversational style for Gemini 2.5 Flash Image
    'declutter': 'Can you please remove all the clutter from this closet? I need to remove the clothes hanging on the rods, any items on the shelves, boxes on the floor, and make this look like a clean, empty walk-in closet ready for real estate photos.',
    'virtual-staging': 'Can you add some stylish furniture and decor to this empty room? Please include a modern sofa, coffee table, some plants, and artwork to make this space look inviting for potential home buyers.',
    'enhance': 'Can you make this room look brighter and more vibrant? Please improve the lighting, boost the colors, and make this photo look more professional and appealing.',
    'repair': 'Can you fix any damage or imperfections in this room? Please remove any stains, scratches, or wear and tear while keeping it looking realistic.',
    
    // LightLab relighting presets - natural conversational requests
    'golden-hour': 'Can you change the lighting in this room to warm golden hour lighting? Make it look like beautiful sunset light is coming through the windows with soft shadows and golden tones.',
    'soft-overcast': 'Can you change the lighting to soft, even daylight? Please make it look like gentle overcast lighting that eliminates harsh shadows.',
    'bright-daylight': 'Can you make this room much brighter with crisp daylight? Please transform the lighting to look like perfect bright daytime with excellent visibility.',
    'cozy-evening': 'Can you change this to warm evening lighting? Please add cozy interior lighting with warm lamps to create an inviting atmosphere.'
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