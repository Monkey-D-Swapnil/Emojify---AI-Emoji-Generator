import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/canvasUtils';
import { ImageFilter } from '../types';

interface ImageEditorProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (processedImage: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onCancel, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState<ImageFilter>('none');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setProcessing(true);
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        filter
      );
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
      alert('Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-lg mx-4 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800">Edit Photo</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-64 w-full bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
                containerStyle: {
                    filter: filter === 'grayscale' ? 'grayscale(100%)' : 
                            filter === 'sepia' ? 'sepia(100%)' : 
                            filter === 'contrast' ? 'contrast(150%)' : 'none'
                }
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Zoom & Rotation */}
          <div className="grid grid-cols-1 gap-4">
             <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
             </div>
             <div>
                <label className="text-xs font-medium text-gray-500 uppercase flex justify-between">
                    Rotation <span>{rotation}°</span>
                </label>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
             </div>
          </div>

          {/* Filters */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Filter</label>
            <div className="flex gap-2">
                {(['none', 'grayscale', 'sepia', 'contrast'] as ImageFilter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-sm rounded-lg border capitalize transition-all ${
                            filter === f 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex justify-end gap-3">
            <button 
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                disabled={processing}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
            >
                {processing ? 'Processing...' : 'Apply & Use'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;