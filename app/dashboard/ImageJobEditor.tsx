'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import UploadGuidelines from '@/components/UploadGuidelines'
import { Upload, Sparkles, Home, Trash2, Paintbrush, Wand2, Download } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCredits } from '@/app/context/CreditContext'


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
  
  // Lighting enhancement selection
  const [selectedLightingStyle, setSelectedLightingStyle] = useState('')
  
  // Temporary custom instructions for modifications
  const [tempCustomInstructions, setTempCustomInstructions] = useState('')


  
  const lightingEnhancementOptions = [
    { value: 'very-warm', label: 'Very Warm', description: 'Change the white balance to very warm' },
    { value: 'indoor-evening', label: 'Indoor Evening', description: 'Change the white balance to indoor evening' },
    { value: 'dusk', label: 'Dusk', description: 'Change the white balance to dusk' },
    { value: 'bright-light', label: 'Bright Light', description: 'Change the white balance to bright light' }
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


  
  const generateRepairPrompt = () => {
    const customInstruction = tempCustomInstructions.trim()
    if (!customInstruction) return ''
    
    // Simple, focused custom modification prompt
    return customInstruction.toLowerCase()
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
          imageUrl: currentImageUrl || uploadedImage, // Use most recent enhanced image
          prompt: repairPrompt,
          preset: null,
          editHistory: [], // No history needed - image contains all previous changes
          isMultiTurn: false // Simple single modification
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
    setTempCustomInstructions('')
    setEditHistory([])
    setCurrentImageUrl(null)
    setEnhancedImage(null)
    setSelectedLightingStyle('')
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">Perfect Your Property Photo Lighting</span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              Transform your listing photos with professional lighting enhancements that make properties more appealing to buyers.
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
              <h3 className="text-lg font-semibold text-blue-800">💡 Lighting Enhancement</h3>
              <p className="text-sm text-blue-700">Choose the perfect lighting mood for your property photo</p>
              
              {/* Lighting Enhancement Selector */}
              <div className="max-w-sm mx-auto space-y-3">
                <Select value={selectedLightingStyle} onValueChange={setSelectedLightingStyle} disabled={editHistory.length > 0}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose lighting enhancement" />
                  </SelectTrigger>
                  <SelectContent>
                    {lightingEnhancementOptions.map((lighting) => (
                      <SelectItem key={lighting.value} value={lighting.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{lighting.label}</span>
                          <span className="text-xs text-gray-500">{lighting.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Locked message when custom modifications exist */}
                {editHistory.length > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                    🔒 Lighting locked after custom modifications. Use &quot;Start Fresh Edit Session&quot; below to change the lighting style.
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

                    
                    // Lighting enhancement prompts
                    const lightingStylePrompts = {
                      'very-warm': 'Change the white balance to very warm',
                      'indoor-evening': 'Change the white balance to indoor evening',
                      'dusk': 'Change the white balance to dusk',
                      'bright-light': 'Change the white balance to bright light'
                    }
                    
                    const quickPrompt = selectedLightingStyle ? lightingStylePrompts[selectedLightingStyle] : 'enhance this property photo with professional real estate quality'
                    
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
                    
                    // State updated with enhanced image
                    
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
                disabled={!uploadedImage || isProcessing || creditBalance <= 0 || !selectedLightingStyle || editHistory.length > 0}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isProcessing ? 'Enhancing...' : 'Enhance Lighting'}
                {uploadedImage && creditBalance > 0 && <span className="ml-2 text-xs">(1 credit)</span>}
              </Button>
              <p className="text-xs text-blue-600">Professional lighting enhancement in one click</p>
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