'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import UploadGuidelines from '@/components/UploadGuidelines'
import { Upload, Image as ImageIcon, Sparkles, Home, Trash2, Paintbrush, Wand2, Download } from 'lucide-react'
import { useCredits } from '@/app/context/CreditContext'

export default function ImageJobEditor() {
  const { creditBalance } = useCredits()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

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

  const handleEnhancePhoto = async () => {
    if (!uploadedImage) return
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      // Simulate progress during processing
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          prompt: customPrompt,
          preset: getSelectedPreset()
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Enhancement failed')
      }

      const result = await response.json()
      
      // Set the actual enhanced image from Gemini 2.5 Flash Image
      setEnhancedImage(result.enhancedImageUrl)

    } catch (error) {
      console.error('Enhancement error:', error)
      setProgress(0)
      // You could add error state here to show user-friendly error messages
    } finally {
      setIsProcessing(false)
    }
  }

  const getAuthToken = async () => {
    const { supabase } = await import('@/lib/supabase-client')
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  const getSelectedPreset = () => {
    // Extract preset from custom prompt or return default
    if (customPrompt.includes('Declutter')) return 'declutter'
    if (customPrompt.includes('Virtual Staging')) return 'virtual-staging'
    if (customPrompt.includes('Repair')) return 'repair'
    if (customPrompt.includes('Golden Hour')) return 'golden-hour'
    if (customPrompt.includes('Soft Overcast')) return 'soft-overcast'
    if (customPrompt.includes('Bright Daylight')) return 'bright-daylight'
    if (customPrompt.includes('Cozy Evening')) return 'cozy-evening'
    if (customPrompt.includes('relighting')) return 'golden-hour' // Default lighting preset
    return 'enhance'
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const canEnhance = uploadedImage && !isProcessing && creditBalance > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Image Enhancement Studio</span>
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
                      className="max-h-64 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-sm text-green-600 font-medium">Image uploaded successfully!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedImage(null)
                        setEnhancedImage(null)
                        setCustomPrompt('')
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
                    className="w-full h-64 object-contain rounded-lg border"
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
                        className="w-full h-64 object-contain rounded-lg border"
                      />
                      <Button
                        onClick={() => downloadImage(enhancedImage, 'enhanced-property-photo.png')}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Enhanced Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <p className="text-gray-500">Enhanced image will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Custom Prompt */}
          {uploadedImage && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Custom Enhancement Instructions
              </label>
              <Input
                placeholder="Describe what you want to enhance or modify in your image..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
          )}

          {/* Preset Buttons */}
          {uploadedImage && (
            <div className="space-y-6">
              {/* Enhancement Presets */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Enhancement Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {enhancementPresets.map((preset) => {
                    const IconComponent = preset.icon
                    return (
                      <Button
                        key={preset.id}
                        variant="outline"
                        onClick={() => handlePresetClick(preset.id, 'enhancement')}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <IconComponent className="h-6 w-6" />
                        <div className="text-center">
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-xs text-gray-500">{preset.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* LightLab Presets */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-700">LightLab Relighting</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">NEW</span>
                </div>
                <p className="text-xs text-gray-600">Transform lighting and time-of-day appearance without changing camera angles</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {lightingPresets.map((preset) => {
                    const IconComponent = preset.icon
                    return (
                      <Button
                        key={preset.id}
                        variant="outline"
                        onClick={() => handlePresetClick(preset.id, 'lighting')}
                        className="h-auto p-4 flex flex-col items-center space-y-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50"
                      >
                        <IconComponent className="h-6 w-6 text-amber-600" />
                        <div className="text-center">
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-xs text-gray-500">{preset.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

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

          {/* Enhance Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleEnhancePhoto}
              disabled={!canEnhance}
              size="lg"
              className="min-w-48"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Enhance Photo'}
              {canEnhance && <span className="ml-2 text-xs">(1 credit)</span>}
            </Button>
          </div>

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