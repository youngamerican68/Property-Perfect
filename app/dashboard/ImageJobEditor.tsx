'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import UploadGuidelines from '@/components/UploadGuidelines'
import { Upload, Image as ImageIcon, Sparkles, Home, Trash2, Paintbrush, Wand2, Download, ChevronDown, Check, Clock, Lock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCredits } from '@/app/context/CreditContext'

type StepData = {
  photoStyleChoice: string
  addElementsChoice: string
  customInstructions: string
}

export default function ImageJobEditor() {
  const { creditBalance } = useCredits()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Conversation history for multi-turn editing - only custom modifications, not dropdown choices
  const [editHistory, setEditHistory] = useState<string[]>([])
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  
  // Room type and style for accurate staging
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [selectedBedroomStyle, setSelectedBedroomStyle] = useState('')
  const [selectedKitchenStyle, setSelectedKitchenStyle] = useState('')
  
  // Sequential step workflow - redesigned
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [stepData, setStepData] = useState<StepData>({
    photoStyleChoice: '',
    addElementsChoice: '',
    customInstructions: ''
  })
  
  // Temporary selections for current step
  const [tempPhotoStyleChoice, setTempPhotoStyleChoice] = useState('')
  const [tempAddElementsChoice, setTempAddElementsChoice] = useState('')
  const [tempCustomInstructions, setTempCustomInstructions] = useState('')

  const enhancementPresets = [
    { id: 'declutter', label: 'Declutter', icon: Home, description: 'Remove unwanted objects' },
    { id: 'virtual-staging', label: 'Virtual Staging', icon: Paintbrush, description: 'Add furniture and decor' },
    { id: 'enhance', label: 'Enhance', icon: Sparkles, description: 'Improve lighting and colors' },
    { id: 'repair', label: 'Repair', icon: Wand2, description: 'Fix damages and imperfections' },
  ]

  const lightingPresets = [
    { id: 'golden-hour', label: 'Golden Hour', icon: Sparkles, description: 'Warm dramatic lighting' },
    { id: 'soft-overcast', label: 'Soft Overcast', icon: Sparkles, description: 'Even flattering daylight' },
    { id: 'bright-daylight', label: 'Bright Daylight', icon: Sparkles, description: 'Crisp clean lighting' },
    { id: 'cozy-evening', label: 'Cozy Evening', icon: Sparkles, description: 'Warm interior ambiance' },
  ]

  // Realtor-focused photo style options
  const photoStyleOptions = [
    { value: 'no-change', label: 'Original Quality', description: 'Keep current photo style as-is' },
    { value: 'hdr', label: 'Professional Real Estate (Recommended)', description: 'Enhanced dynamic range - properties sell 32% faster' },
    { value: 'bright-airy', label: 'Bright & Airy (Ideal for Listings)', description: 'Popular Instagram-style for maximum online appeal' },
    { value: 'luxury', label: 'Luxury Look (Premium Properties)', description: 'Sophisticated color grading for high-end homes' },
    { value: 'professional', label: 'Crisp & Clean (Commercial)', description: 'Minimal processing for commercial properties' }
  ]

  const addElementsOptions = [
    { value: 'no-change', label: 'No Additions', description: 'Keep space exactly as-is' },
    { value: 'staging', label: 'Room-Appropriate Staging', description: 'Add furniture that matches the room type' },
    { value: 'plants', label: 'Plants & Greenery', description: 'Add tasteful plants and natural elements' },
    { value: 'decor', label: 'Artwork & Decor', description: 'Add professional decor and artwork' },
    { value: 'lighting-fixtures', label: 'Lighting Fixtures', description: 'Add warm interior lighting elements' }
  ]
  
  const roomTypeOptions = [
    { value: 'bedroom', label: 'Bedroom', description: 'Bedroom with multiple styling options' },
    { value: 'living-room', label: 'Living Room', description: 'Coming soon - living room styles' },
    { value: 'kitchen', label: 'Kitchen', description: 'Kitchen with multiple styling options' },
    { value: 'dining-room', label: 'Dining Room', description: 'Coming soon - dining styles' },
    { value: 'bathroom', label: 'Bathroom', description: 'Coming soon - bathroom styles' },
    { value: 'office', label: 'Home Office', description: 'Coming soon - office styles' },
    { value: 'other', label: 'Other/Mixed', description: 'General enhancement' }
  ]
  
  const bedroomStyleOptions = [
    { value: 'hotel-clean', label: 'Hotel-Quality Clean', description: 'Make the bed neatly, with sheets and blankets perfectly tucked in and smoothed' },
    { value: 'cozy-warm', label: 'Cozy & Warm', description: 'Soft textures, warm lighting, natural elements for serene retreat' },
    { value: 'modern-minimalist', label: 'Modern & Minimalist', description: 'Clean lines, neutral palette, decluttered sophisticated feel' },
    { value: 'vibrant-eclectic', label: 'Vibrant & Eclectic', description: 'Bold patterns, colorful textiles, unique art for lively atmosphere' },
    { value: 'luxury-elegant', label: 'Luxury & Elegant', description: 'High-end bedding, opulent drapes, elegant furniture for luxury market' },
    { value: 'general-enhancement', label: 'General Enhancement', description: 'Improved lighting, organization, refreshed colors for broad appeal' }
  ]
  
  const kitchenStyleOptions = [
    { value: 'bright-clean', label: 'Bright & Clean', description: 'Brighten the kitchen with abundant natural light streaming through the windows and ensure all surfaces appear sparkling clean.' },
    { value: 'spacious-tidy', label: 'Spacious & Tidy', description: 'Maximize the sense of spaciousness by enhancing the existing natural light, tidying all open shelves, and adding a subtle, light-colored decorative accent (e.g., a simple white pitcher) to a counter' },
    { value: 'warm-golden', label: 'Warm & Sophisticated', description: 'Bathe the kitchen in soft, warm, golden hour lighting from strategically placed lamps and under-cabinet glow, creating a sophisticated and intimate atmosphere' },
    { value: 'bold-vibrant', label: 'Bold & Vibrant', description: 'Infuse the kitchen with bold patterns on tiles or backsplashes, colorful small appliances or textiles, and unique, expressive decor pieces, creating a lively and individualistic atmosphere' },
    { value: 'luxury-elegant', label: 'Luxury & Refined', description: 'Elevate the kitchen with high-end, polished finishes (e.g., marble or quartz), sophisticated lighting fixtures, and integrated, top-tier appliances, conveying a refined and opulent appeal' }
  ]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    // TODO: Implement file validation and upload
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = (file: File) => {
    // TODO: Implement proper file validation
    console.log('Uploading file:', file.name)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Step completion handlers
  const handleStepComplete = (step: number) => {
    if (step === 1) {
      // Complete Step 1 - Photo Style
      if (!tempPhotoStyleChoice) return
      
      setStepData(prev => ({ ...prev, photoStyleChoice: tempPhotoStyleChoice }))
      setCompletedSteps(prev => new Set([...prev, 1]))
      setCurrentStep(2)
      setTempPhotoStyleChoice('')
    } else if (step === 2) {
      // Complete Step 2 - Add Elements
      if (!tempAddElementsChoice) return
      
      setStepData(prev => ({ ...prev, addElementsChoice: tempAddElementsChoice }))
      setCompletedSteps(prev => new Set([...prev, 2]))
      // Ready for transformation
      setTempAddElementsChoice('')
    }
  }

  const canCompleteStep = (step: number) => {
    if (step === 1) return tempPhotoStyleChoice !== ''
    if (step === 2) return tempAddElementsChoice !== ''
    return false
  }

  const isStepAccessible = (step: number) => {
    if (step === 1) return true
    if (step === 2) return completedSteps.has(1)
    return false
  }

  const generateTransformPrompt = () => {
    const parts = []
    
    // Add photo style transformations (realtor-focused)
    if (stepData.photoStyleChoice && stepData.photoStyleChoice !== 'no-change') {
      const photoStyleDescriptions = {
        'professional': 'Edit this image to crisp, clean commercial real estate photography with minimal processing, perfect exposure, and professional clarity',
        'hdr': 'Edit this image with HDR real estate photography enhancement, boosting dynamic range, eliminating shadows, and creating vibrant, well-exposed details throughout',
        'bright-airy': 'Edit this image with bright, airy Instagram-style enhancement featuring enhanced natural light, vibrant colors, and inviting atmosphere perfect for online listings',
        'luxury': 'Edit this image with sophisticated luxury real estate photography featuring refined color grading, enhanced depth, and premium visual appeal for high-end properties'
      }
      parts.push(photoStyleDescriptions[stepData.photoStyleChoice])
    }
    
    // Add element additions (very reliable)
    if (stepData.addElementsChoice && stepData.addElementsChoice !== 'no-change') {
      const addElementsDescriptions = {
        'staging': 'add modern staging furniture including a contemporary sofa, elegant coffee table, and stylish accent pieces to create an inviting, furnished space',
        'plants': 'add tasteful plants and greenery including potted plants, small trees, and natural elements to bring life and freshness to the space',
        'decor': 'add professional decor including framed artwork, decorative objects, and stylish accessories to create a polished, designed appearance',
        'lighting-fixtures': 'add warm interior lighting elements including table lamps, floor lamps, and ambient lighting fixtures to create a cozy, welcoming atmosphere'
      }
      parts.push(addElementsDescriptions[stepData.addElementsChoice])
    }
    
    if (parts.length === 0) {
      return 'transform this property photo into a professional, appealing real estate image that attracts potential buyers'
    }
    
    // Combine dropdown instructions only
    if (parts.length === 1) {
      return parts[0]
    } else {
      return `${parts[0]}, while also ${parts.slice(1).join(', and ')}`
    }
  }
  
  const generateRepairPrompt = () => {
    const customInstruction = tempCustomInstructions.trim()
    if (!customInstruction) return ''
    
    // Simple, focused custom modification prompt
    return customInstruction.toLowerCase()
  }

  const handlePresetClick = (presetId: string, category: 'enhancement' | 'lighting') => {
    console.log('Selected preset:', presetId, 'category:', category)
    
    const allPresets = [...enhancementPresets, ...lightingPresets]
    const preset = allPresets.find(p => p.id === presetId)
    
    if (category === 'lighting') {
      setCustomPrompt(`Apply ${preset?.label} relighting to transform the lighting and time-of-day appearance`)
    } else {
      setCustomPrompt(`Apply ${preset?.label} enhancement`)
    }
  }

  const handleTransformPhoto = async () => {
    if (!uploadedImage) return
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const baseImageUrl = currentImageUrl || uploadedImage
      const transformPrompt = generateTransformPrompt()
      
      console.log('Transform prompt:', transformPrompt)
      
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          imageUrl: baseImageUrl,
          prompt: transformPrompt,
          preset: null,
          editHistory: editHistory,
          isMultiTurn: editHistory.length > 0
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Enhancement failed')
      }

      const result = await response.json()
      
      const newHistory = [...editHistory, transformPrompt]
      setEditHistory(newHistory)
      setCurrentImageUrl(result.enhancedImageUrl)
      setEnhancedImage(result.enhancedImageUrl)

    } catch (error) {
      console.error('Transform error:', error)
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleApplyRepair = async () => {
    if (!uploadedImage || !tempCustomInstructions.trim()) return
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const repairPrompt = generateRepairPrompt()
      
      console.log('Repair prompt:', repairPrompt)
      
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          imageUrl: currentImageUrl || uploadedImage, // Use original image for repair-first
          prompt: repairPrompt,
          preset: null,
          editHistory: [], // Fresh start for repair
          isMultiTurn: false
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Repair failed')
      }

      const result = await response.json()
      
      // Update with repaired image and add custom modification to edit history
      setEnhancedImage(result.enhancedImageUrl)
      setCurrentImageUrl(result.enhancedImageUrl)
      
      // Add this custom modification to edit history
      const newHistory = [...editHistory, repairPrompt]
      setEditHistory(newHistory)

    } catch (error) {
      console.error('Repair error:', error)
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const getAuthToken = async () => {
    const { supabase } = await import('@/lib/supabase-client')
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }


  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetWorkflow = () => {
    setCurrentStep(1)
    setCompletedSteps(new Set())
    setStepData({
      photoStyleChoice: '',
      addElementsChoice: '',
      customInstructions: ''
    })
    setTempPhotoStyleChoice('')
    setTempAddElementsChoice('')
    setTempCustomInstructions('')
    setEditHistory([])
    setCurrentImageUrl(null)
    setEnhancedImage(null)
  }

  const canTransform = uploadedImage && !isProcessing && creditBalance > 0 && completedSteps.size > 0
  const canRepair = enhancedImage && !isProcessing && creditBalance > 0 && tempCustomInstructions.trim()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">Sell Homes Faster with Stunning AI-Enhanced Photos</span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              Turn ordinary listing photos into buyer magnets. Brighten rooms, declutter spaces, and stage with modern furniture — all in seconds.
            </p>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <span>✅ 98% Success Rate</span>
              <span>📸 24,000+ Images Enhanced</span>
              <span>🏠 Properties sell 32% faster</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : uploadedImage 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="max-h-96 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-sm text-green-600 font-medium">Image uploaded successfully!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedImage(null)
                        resetWorkflow()
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Drop your image here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Guidelines */}
            <div>
              <UploadGuidelines />
            </div>
          </div>

          {/* Before/After Panels */}
          {uploadedImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Before</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={uploadedImage} 
                    alt="Original" 
                    className="w-full h-96 object-contain rounded-lg border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">After</CardTitle>
                </CardHeader>
                <CardContent>
                  {enhancedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={enhancedImage} 
                        alt="Enhanced" 
                        className="w-full h-96 object-contain rounded-lg border"
                      />
                      <Button
                        onClick={() => downloadImage(enhancedImage, 'enhanced-property-photo.png')}
                        variant="outline"
                        size="sm"
                        className="w-full mb-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Enhanced Photo
                      </Button>
                      {editHistory.length > 0 && (
                        <Button
                          onClick={() => {
                            resetWorkflow()
                            console.log('Starting fresh edit session - cleared all state')
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Start Fresh Edit Session
                        </Button>
                      )}
                      
                      {/* Post-Generation Custom Modifications */}
                      <div className="mt-4 pt-4 border-t-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
                        <h5 className="font-bold text-lg mb-3 text-orange-800 text-center">🎨 Make Additional Changes</h5>
                        <p className="text-sm text-orange-700 text-center mb-4">Perfect your photo with custom tweaks and modifications</p>
                        <div className="space-y-3">
                          <Input
                            placeholder="e.g., 'remove the TV', 'change pillow color to blue', 'add a plant on nightstand'..."
                            value={tempCustomInstructions}
                            onChange={(e) => setTempCustomInstructions(e.target.value)}
                            className="border-orange-200 focus:border-orange-400"
                          />
                          <Button
                            onClick={() => {
                              setStepData(prev => ({ ...prev, customInstructions: tempCustomInstructions }))
                              handleApplyRepair()
                            }}
                            disabled={!enhancedImage || !tempCustomInstructions.trim() || isProcessing || creditBalance <= 0}
                            size="lg"
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            {isProcessing ? 'Modifying...' : 'Apply Modification'}
                            {enhancedImage && tempCustomInstructions.trim() && creditBalance > 0 && <span className="ml-2 text-xs">(1 credit)</span>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <p className="text-gray-500">Enhanced image will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Enhance Option */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-blue-800">🚀 Quick Enhance (Recommended)</h3>
              <p className="text-sm text-blue-700">Let AI automatically enhance your photos with proven settings that help properties sell faster</p>
              
              {/* Room Type & Style Selectors */}
              <div className="max-w-sm mx-auto space-y-3">
                <Select value={selectedRoomType} onValueChange={(value) => {
                  setSelectedRoomType(value)
                  setSelectedBedroomStyle('') // Reset style when room changes
                  setSelectedKitchenStyle('') // Reset kitchen style when room changes
                }} disabled={editHistory.length > 0}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="1. What type of room is this?" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypeOptions.map((room) => (
                      <SelectItem key={room.value} value={room.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{room.label}</span>
                          <span className="text-xs text-gray-500">{room.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Bedroom Style Options */}
                {selectedRoomType === 'bedroom' && (
                  <Select value={selectedBedroomStyle} onValueChange={setSelectedBedroomStyle} disabled={editHistory.length > 0}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="2. Choose bedroom style" />
                    </SelectTrigger>
                    <SelectContent>
                      {bedroomStyleOptions.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{style.label}</span>
                            <span className="text-xs text-gray-500">{style.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Kitchen Style Options */}
                {selectedRoomType === 'kitchen' && (
                  <Select value={selectedKitchenStyle} onValueChange={setSelectedKitchenStyle} disabled={editHistory.length > 0}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="2. Choose kitchen style" />
                    </SelectTrigger>
                    <SelectContent>
                      {kitchenStyleOptions.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{style.label}</span>
                            <span className="text-xs text-gray-500">{style.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Other room types - coming soon message */}
                {selectedRoomType && selectedRoomType !== 'bedroom' && selectedRoomType !== 'kitchen' && selectedRoomType !== 'other' && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    🚧 {roomTypeOptions.find(r => r.value === selectedRoomType)?.label} styles coming soon! For now, use the Custom Fine-Tuning section below for enhancements.
                  </div>
                )}
                
                {/* Locked message when custom modifications exist */}
                {editHistory.length > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                    🔒 Style locked after custom modifications. Use "Start Fresh Edit Session" below to change the base style.
                  </div>
                )}
              </div>
              <Button
                onClick={async () => {
                  // Quick Enhance with explicit prompt to avoid state timing issues
                  setIsProcessing(true)
                  setProgress(0)
                  
                  try {
                    const progressInterval = setInterval(() => {
                      setProgress(prev => Math.min(prev + 10, 90))
                    }, 500)

                    const baseImageUrl = currentImageUrl || uploadedImage
                    
                    // Room-specific Quick Enhance prompt (HDR + appropriate staging)
                    // Exact working prompts from AI Studio testing
                    const bedroomStylePrompts = {
                      'hotel-clean': 'Make the bed neatly, with the sheets and blankets perfectly tucked in and smoothed, as if ready for a hotel guest',
                      'cozy-warm': 'Enhance the bedroom with soft, inviting textures, warm lighting, and natural elements like a wooden headboard and a potted plant, creating a cozy and serene retreat',
                      'modern-minimalist': 'Modernize the bedroom with clean lines, a neutral color palette, smart storage solutions to reduce clutter, and subtle metallic accents for a sleek and sophisticated feel',
                      'vibrant-eclectic': 'Infuse the bedroom with personality by adding bold patterns, a mix of colorful textiles, unique art pieces, and a statement piece of furniture for an eclectic and lively atmosphere',
                      'luxury-elegant': 'Transform the bedroom into a luxurious sanctuary with high-thread-count bedding, opulent drapes, a plush rug, elegant mirrored furniture, and soft, ambient lighting',
                      'general-enhancement': 'Enhance the bedroom with improved lighting, thoughtful organization, a refreshed color scheme, and carefully selected decorative accents to create a more inviting and aesthetically pleasing space'
                    }
                    
                    const kitchenStylePrompts = {
                      'bright-clean': 'Brighten the kitchen with abundant natural light streaming through the windows and ensure all surfaces appear sparkling clean.',
                      'spacious-tidy': 'Maximize the sense of spaciousness by enhancing the existing natural light, tidying all open shelves, and adding a subtle, light-colored decorative accent (e.g., a simple white pitcher) to a counter',
                      'warm-golden': 'Bathe the kitchen in soft, warm, golden hour lighting from strategically placed lamps and under-cabinet glow, creating a sophisticated and intimate atmosphere',
                      'bold-vibrant': 'Infuse the kitchen with bold patterns on tiles or backsplashes, colorful small appliances or textiles, and unique, expressive decor pieces, creating a lively and individualistic atmosphere',
                      'luxury-elegant': 'Elevate the kitchen with high-end, polished finishes (e.g., marble or quartz), sophisticated lighting fixtures, and integrated, top-tier appliances, conveying a refined and opulent appeal'
                    }
                    
                    let stagingInstruction = ''
                    if (selectedRoomType === 'bedroom' && selectedBedroomStyle) {
                      stagingInstruction = bedroomStylePrompts[selectedBedroomStyle]
                    } else if (selectedRoomType === 'kitchen' && selectedKitchenStyle) {
                      stagingInstruction = kitchenStylePrompts[selectedKitchenStyle]
                    } else {
                      stagingInstruction = 'enhance this property photo with professional real estate quality and appropriate staging'
                    }
                    
                    // Use exact working prompts without HDR prefix for bedroom and kitchen styles
                    const quickPrompt = (selectedRoomType === 'bedroom' && selectedBedroomStyle) || (selectedRoomType === 'kitchen' && selectedKitchenStyle) ? stagingInstruction : `Edit this image with HDR real estate photography enhancement, boosting dynamic range, eliminating shadows, and creating vibrant, well-exposed details throughout, while also ${stagingInstruction}`
                    
                    console.log('Quick Enhance prompt:', quickPrompt)
                    
                    const response = await fetch('/api/enhance', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await getAuthToken()}`
                      },
                      body: JSON.stringify({
                        imageUrl: editHistory.length > 0 ? (currentImageUrl || uploadedImage) : uploadedImage, // Use original image if no custom mods
                        prompt: quickPrompt,
                        preset: null,
                        editHistory: editHistory,
                        isMultiTurn: editHistory.length > 0
                      })
                    })

                    clearInterval(progressInterval)
                    setProgress(100)

                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(errorData.error || 'Enhancement failed')
                    }

                    const result = await response.json()
                    
                    // Update state after successful enhancement
                    setStepData({
                      photoStyleChoice: 'hdr',
                      addElementsChoice: 'staging',
                      customInstructions: ''
                    })
                    setCompletedSteps(new Set([1, 2]))
                    
                    // Don't add dropdown choices to edit history - only add custom modifications
                    setCurrentImageUrl(result.enhancedImageUrl)
                    setEnhancedImage(result.enhancedImageUrl)

                  } catch (error) {
                    console.error('Quick Enhance error:', error)
                    setProgress(0)
                  } finally {
                    setIsProcessing(false)
                  }
                }}
                disabled={!uploadedImage || isProcessing || creditBalance <= 0 || !selectedRoomType || (selectedRoomType === 'bedroom' && !selectedBedroomStyle) || (selectedRoomType === 'kitchen' && !selectedKitchenStyle) || editHistory.length > 0}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isProcessing ? 'Enhancing...' : 'Quick Enhance Photo'}
                {uploadedImage && creditBalance > 0 && <span className="ml-2 text-xs">(1 credit)</span>}
              </Button>
              <p className="text-xs text-blue-600">HDR Professional Quality + Modern Staging in one click</p>
            </div>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing your image...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Custom Fine-Tuning */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="text-md font-semibold text-center mb-3">Custom Fine-Tuning</h4>
            <div className="space-y-3">
              <Input
                placeholder="e.g., 'remove the TV', 'change pillow color to blue', 'add a plant on nightstand'..."
                value={tempCustomInstructions}
                onChange={(e) => setTempCustomInstructions(e.target.value)}
              />
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setStepData(prev => ({ ...prev, customInstructions: tempCustomInstructions }))
                    handleApplyRepair()
                  }}
                  disabled={!uploadedImage || isProcessing || creditBalance <= 0 || !tempCustomInstructions.trim()}
                  size="lg"
                  variant="outline"
                  className="min-w-48"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Applying...' : 'Apply Custom Changes'}
                  {uploadedImage && creditBalance > 0 && tempCustomInstructions.trim() && <span className="ml-2 text-xs">(1 credit)</span>}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Helper text */}
          {uploadedImage && !canTransform && completedSteps.size === 0 && (
            <div className="text-center text-sm text-gray-600">
              Complete at least one step above to transform photo
            </div>
          )}

          {/* Credit Warning */}
          {creditBalance === 0 && (
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                You have no credits remaining. <a href="/pricing" className="underline">Purchase more credits</a> to continue enhancing images.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}