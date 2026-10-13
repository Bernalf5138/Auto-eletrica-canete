import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Upload, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Fotografiar Repuesto / Producto"
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startStream = async (mode: 'environment' | 'user') => {
    stopStream();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      setCameraError("No se pudo acceder a la cámara del dispositivo. Puede seleccionar una foto de la galería o archivo.");
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startStream(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, capturedImage]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopStream();
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopStream();
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedImage(reader.result);
          stopStream();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <Camera className="w-5 h-5" />
            <span className="text-white text-base font-semibold">{title}</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport: Live Stream or Captured Preview */}
        <div className="relative bg-black flex-1 min-h-[340px] flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Foto Capturada"
              className="max-h-[380px] w-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover min-h-[320px]"
            />
          )}

          {/* Camera Error banner */}
          {cameraError && !capturedImage && (
            <div className="absolute inset-x-4 top-4 bg-red-950/90 border border-red-700 text-red-200 p-3 rounded-xl text-xs flex items-start gap-2 z-10">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Switch Camera Button (Front / Rear) */}
          {!capturedImage && !cameraError && (
            <button
              onClick={handleSwitchCamera}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-neutral-900/80 text-white backdrop-blur border border-neutral-700 hover:bg-neutral-800 transition"
              title="Alternar Câmera Frontal / Traseira"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  startStream(facingMode);
                }}
                className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Tirar Outra
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition"
              >
                <Check className="w-4 h-4" />
                Usar Esta Foto
              </button>
            </>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-medium rounded-xl text-xs flex items-center gap-2 transition"
                title="Escolher arquivo do celular ou PC"
              >
                <Upload className="w-4 h-4" />
                Galeria / Arquivo
              </button>

              <button
                onClick={handleTakeSnapshot}
                className="flex-1 py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition active:scale-95"
              >
                <Camera className="w-5 h-5" />
                Capturar Foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
