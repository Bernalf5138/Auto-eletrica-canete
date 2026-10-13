import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Flashlight, AlertCircle, ScanBarcode, CheckCircle2 } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = "Lector de Código de Barras (Cámara)"
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-container";

  // Audio beep playback on scan success
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1750, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio not permitted or not supported
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(() => {}).then(() => {
          qrCodeScannerRef.current?.clear();
          qrCodeScannerRef.current = null;
        });
      }
      return;
    }

    let isMounted = true;
    setScannerError(null);
    setLastScanned(null);

    const initScanner = async () => {
      try {
        // Small delay to ensure modal DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });
        qrCodeScannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            playBeep();
            setLastScanned(decodedText);
            onScan(decodedText);
            // Vibrate if mobile device
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }
            setTimeout(() => {
              onClose();
            }, 600);
          },
          () => {
            // Scanning frame failure is normal until barcode is detected
          }
        );
      } catch (err: unknown) {
        console.error("Scanner start error:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setScannerError(
          errMsg.includes("NotAllowedError")
            ? "Permiso de cámara denegado. Permita el acceso a la cámara en los ajustes del dispositivo o ingrese el código manualmente."
            : "No fue posible iniciar la cámara. Verifique que otra aplicación no la esté usando."
        );
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(() => {}).then(() => {
          qrCodeScannerRef.current?.clear();
          qrCodeScannerRef.current = null;
        });
      }
    };
  }, [isOpen, onScan, onClose]);

  const toggleTorch = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.applyVideoConstraints({
          // @ts-expect-error torch constraint
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch (err) {
        console.warn("Torch not supported on this camera:", err);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      playBeep();
      onScan(manualCode.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <ScanBarcode className="w-6 h-6 animate-pulse" />
            <span className="text-white text-base font-semibold">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Camera Viewport */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          <div id={scannerContainerId} className="w-full h-full min-h-[280px]"></div>

          {/* Overlay guide line for targeting barcode */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[80%] h-36 border-2 border-red-500/80 rounded-xl relative shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
              <div className="absolute -top-3 left-4 bg-neutral-900/90 text-red-400 text-xs px-2 py-0.5 rounded font-mono">
                Aponte para o código de barras
              </div>
            </div>
          </div>

          {/* Flashlight toggle */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={toggleTorch}
              className={`p-3 rounded-full backdrop-blur-md transition ${
                torchOn ? 'bg-amber-500 text-black' : 'bg-neutral-800/80 text-white hover:bg-neutral-700'
              }`}
              title="Encender linterna (si está disponible)"
            >
              <Flashlight className="w-5 h-5" />
            </button>
          </div>

          {/* Success Scan Feedback */}
          {lastScanned && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 z-20 animate-in fade-in">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2" />
              <div className="text-white font-bold text-lg">¡Código Leído con Éxito!</div>
              <div className="text-emerald-300 font-mono text-xl mt-1 bg-emerald-900/60 px-4 py-1.5 rounded-lg border border-emerald-500/40">
                {lastScanned}
              </div>
            </div>
          )}

          {/* Error notice */}
          {scannerError && (
            <div className="absolute inset-x-4 top-4 bg-red-950/90 border border-red-700 text-red-200 p-3 rounded-xl text-xs flex items-start gap-2 z-10">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{scannerError}</span>
            </div>
          )}
        </div>

        {/* Footer with Manual Input fallback */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ingresar código manualmente o escanear..."
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl transition"
            >
              Confirmar
            </button>
          </form>

          <p className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1">
            <Camera className="w-3.5 h-3.5 text-neutral-500" />
            Funciona con cámara del celular, webcam o lector USB de código de barras
          </p>
        </div>
      </div>
    </div>
  );
};
