import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileImage, HardDrive, Monitor } from 'lucide-react'

export default function UploadGuidelines() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Guidelines</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FileImage className="h-4 w-4 text-blue-500" />
              <span><strong>Accepted formats:</strong> JPG, PNG, WEBP</span>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <HardDrive className="h-4 w-4 text-green-500" />
              <span><strong>Max file size:</strong> 10MB</span>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Monitor className="h-4 w-4 text-purple-500" />
              <span><strong>Max resolution:</strong> 4096x4096px</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> For best results, upload high-quality images with good lighting and clear details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}