'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, RotateCcw, Calendar, Clock } from 'lucide-react'

interface Job {
  id: string
  originalImage: string
  enhancedImage: string
  status: 'completed' | 'failed'
  createdAt: string
  processingTime: string
  prompt: string
}

export default function RecentJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchJobs = async () => {
      setIsLoading(true)
      
      // Simulate API delay
      setTimeout(() => {
        // Mock data for demonstration
        const mockJobs: Job[] = [
          {
            id: '1',
            originalImage: '/placeholder-before.jpg',
            enhancedImage: '/placeholder-after.jpg',
            status: 'completed',
            createdAt: '2024-01-20T10:30:00Z',
            processingTime: '45s',
            prompt: 'Declutter living room and enhance lighting'
          },
          {
            id: '2',
            originalImage: '/placeholder-before-2.jpg',
            enhancedImage: '/placeholder-after-2.jpg',
            status: 'completed',
            createdAt: '2024-01-19T15:45:00Z',
            processingTime: '52s',
            prompt: 'Virtual staging with modern furniture'
          },
          {
            id: '3',
            originalImage: '/placeholder-before-3.jpg',
            enhancedImage: '/placeholder-after-3.jpg',
            status: 'failed',
            createdAt: '2024-01-19T09:15:00Z',
            processingTime: '30s',
            prompt: 'Remove damaged wall and repair ceiling'
          }
        ]
        setJobs(mockJobs)
        setIsLoading(false)
      }, 2000) // 2 second delay to show loading state
    }

    fetchJobs()
  }, [])

  const handleRedownload = (jobId: string) => {
    // TODO: Implement actual download functionality
    console.log('Re-downloading job:', jobId)
  }

  const handleTryAgain = (jobId: string) => {
    // TODO: Implement retry functionality
    console.log('Trying again for job:', jobId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const JobSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Image skeletons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="w-full h-32 rounded-lg" />
              <Skeleton className="h-4 w-16 mt-2" />
            </div>
            <div>
              <Skeleton className="w-full h-32 rounded-lg" />
              <Skeleton className="h-4 w-16 mt-2" />
            </div>
          </div>
          
          {/* Details skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Enhancements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <JobSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent enhancements</h3>
            <p className="text-gray-500">Your enhanced images will appear here once you start processing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Before/After Images */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border">
                          <span className="text-xs text-gray-500">Original</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Before</p>
                      </div>
                      <div>
                        <div className={`w-full h-32 rounded-lg flex items-center justify-center border ${
                          job.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {job.status === 'completed' ? (
                            <span className="text-xs text-green-600">Enhanced</span>
                          ) : (
                            <span className="text-xs text-red-600">Failed</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">After</p>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 line-clamp-2">{job.prompt}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{job.processingTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {job.status === 'completed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRedownload(job.id)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Re-download
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTryAgain(job.id)}
                          className="flex-1"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Try Again
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}