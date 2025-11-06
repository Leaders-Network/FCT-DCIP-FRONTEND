'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, RotateCw, ZoomIn, Download, MapPin } from 'lucide-react';
import { uploadSurveyDocument } from '@/services/api';
import { DocumentFile } from '@/types/api.types';

interface PhotoCaptureProps {
  onPhotoUploaded: (document: DocumentFile) => void;
  onError: (error: string) => void;
  category?: 'photos' | 'receipts' | 'inspection_forms';
  documentType?: 'photo' | 'receipt';
  className?: string;
  enableLocation?: boolean;
  maxPhotos?: number;
}

interface CapturedPhoto {
  id: string;
  blob: Blob;
  dataUrl: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoUploaded,
  onError,
  category = 'photos',
  documentType = 'photo',
  className = '',
  enableLocation = true,
  maxPhotos = 10
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCurrentStream(stream);
        setIsCapturing(true);
      }
    } catch (error: unknown) {
      console.error('Error accessing camera:', error);
      onError('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    setIsCapturing(false);
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      let location;
      if (enableLocation) {
        try {
          const position = await getCurrentLocation();
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.warn('Could not get location:', error);
        }
      }

      const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      const newPhoto: CapturedPhoto = {
        id: photoId,
        blob,
        dataUrl,
        timestamp: new Date(),
        location
      };

      setCapturedPhotos(prev => [...prev, newPhoto]);
    }, 'image/jpeg', 0.8);
  };

  const uploadPhoto = async (photo: CapturedPhoto) => {
    setIsUploading(true);

    try {
      // Create a file from blob
      const file = new File([photo.blob], `photo-${photo.timestamp.getTime()}.jpg`, {
        type: 'image/jpeg'
      });

      // Prepare upload data
      const uploadData = {
        category,
        documentType,
        description: `Photo captured on ${photo.timestamp.toLocaleString()}`
      };

      const response = await uploadSurveyDocument(file, uploadData);

      if (response.success && response.document) {
        onPhotoUploaded(response.document);

        // Remove from captured photos
        setCapturedPhotos(prev => prev.filter(p => p.id !== photo.id));
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError(`Failed to upload photo: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = (photoId: string) => {
    setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;

          // Create blob from file
          const photoId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const newPhoto: CapturedPhoto = {
            id: photoId,
            blob: file,
            dataUrl,
            timestamp: new Date()
          };

          setCapturedPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Clear input
    event.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Photo Capture</h4>
        <div className="flex items-center space-x-2">
          {!isCapturing ? (
            <>
              <button
                onClick={startCamera}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={capturedPhotos.length >= maxPhotos}
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={capturedPhotos.length >= maxPhotos}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={capturePhoto}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                disabled={capturedPhotos.length >= maxPhotos}
              >
                <Camera className="w-5 h-5" />
                <span>Capture</span>
              </button>

              <button
                onClick={stopCamera}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photo count indicator */}
      <div className="text-sm text-gray-600">
        Photos captured: {capturedPhotos.length} / {maxPhotos}
      </div>

      {/* Camera View */}
      {isCapturing && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto max-h-96"
          />

          {/* Camera overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-white opacity-30 rounded-lg"></div>
          </div>

          {/* Location indicator */}
          {enableLocation && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>Location: ON</span>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Captured Photos Grid */}
      {capturedPhotos.length > 0 && (
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-700">
            Captured Photos ({capturedPhotos.length})
          </h5>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {capturedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo.dataUrl}
                    alt={`Captured photo ${photo.id}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedPhoto(photo.id)}
                  />
                </div>

                {/* Photo Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedPhoto(photo.id)}
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                      title="View full size"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => uploadPhoto(photo)}
                      disabled={isUploading}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                      title="Upload photo"
                    >
                      <Upload className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Delete photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Info */}
                <div className="mt-2 text-xs text-gray-600">
                  <p>{photo.timestamp.toLocaleTimeString()}</p>
                  <p>{formatFileSize(photo.blob.size)}</p>
                  {photo.location && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <MapPin className="w-3 h-3" />
                      <span>GPS</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={capturedPhotos.find(p => p.id === selectedPhoto)?.dataUrl}
              alt="Photo preview"
              className="max-w-full max-h-full object-contain"
            />

            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Photo actions in modal */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <button
                onClick={() => {
                  const photo = capturedPhotos.find(p => p.id === selectedPhoto);
                  if (photo) uploadPhoto(photo);
                }}
                disabled={isUploading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>

              <button
                onClick={() => {
                  deletePhoto(selectedPhoto);
                  setSelectedPhoto(null);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading photo...</p>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;