'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function TestDashboard() {
  const [imageResult, setImageResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState('golden-hour')
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const testEnhancement = async () => {
    setIsLoading(true)
    try {
      let imageToUse = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      
      // Use selected image if available
      if (selectedFile && imagePreview) {
        imageToUse = imagePreview
      }
      
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          imageUrl: imageToUse,
          preset: selectedPreset,
          prompt: `Transform this image with ${selectedPreset.replace('-', ' ')} lighting`
        })
      })

      const result = await response.json()
      setImageResult(JSON.stringify(result, null, 2))
      
      // Extract enhanced image if present
      if (result.enhancedImageUrl) {
        setEnhancedImage(result.enhancedImageUrl)
      }
    } catch (error) {
      setImageResult(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PropertyPerfect Test Dashboard</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🧪 Authentication Bypass Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              This page bypasses authentication to test the core image enhancement functionality.
            </p>
            
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload Property Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mb-2"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="max-w-xs max-h-48 rounded border" />
                  </div>
                )}
              </div>

              {/* Preset Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Enhancement Preset</label>
                <select 
                  value={selectedPreset} 
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="golden-hour">Golden Hour</option>
                  <option value="soft-overcast">Soft Overcast</option>
                  <option value="bright-daylight">Bright Daylight</option>
                  <option value="cozy-evening">Cozy Evening</option>
                  <option value="declutter">Declutter</option>
                  <option value="virtual-staging">Virtual Staging</option>
                  <option value="enhance">Enhance</option>
                  <option value="repair">Repair</option>
                </select>
              </div>

              <Button 
                onClick={testEnhancement} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Test Image Enhancement'}
              </Button>
            </div>

            {enhancedImage && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Enhanced Image:</h3>
                <div className="space-y-4">
                  <img src={enhancedImage} alt="Enhanced" className="max-w-full max-h-96 rounded border" />
                  <Button 
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = enhancedImage
                      link.download = `enhanced-${selectedPreset}-${Date.now()}.jpg`
                      link.click()
                    }}
                    className="w-full"
                  >
                    Download Enhanced Image
                  </Button>
                </div>
              </div>
            )}

            {imageResult && (
              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <h3 className="font-semibold mb-2">API Response:</h3>
                <pre className="text-sm overflow-auto max-h-32">{imageResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📝 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Test the API endpoint response above</li>
              <li>Fix authentication if needed</li>
              <li>Test with real image once auth works</li>
              <li>Verify Gemini 2.5 Flash Image transformation</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}