import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Receipt,
  Store,
  Calendar,
  Banknote,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { ScannedReceiptResult } from '../types';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedResult: (result: ScannedReceiptResult, imageBase64: string) => void;
}

// Demo Thai receipts for quick 1-click testing if user does not have a physical slip
const SAMPLE_RECEIPTS = [
  {
    name: 'ตัวอย่าง 1: บิล 7-Eleven (เงินสด)',
    merchant: '7-Eleven สาขาอโศก',
    amount: 145.0,
    category: 'อาหารและเครื่องดื่ม',
    paymentMethod: 'cash' as const,
    date: new Date().toISOString().split('T')[0],
    time: '12:15',
    items: [
      { name: 'ข้าวผัดกะเพราไก่', price: 47 },
      { name: 'ชิซูกะ โออิชิ ชาเขียว', price: 30 },
      { name: 'แซนวิชอบร้อนแฮมชีส', price: 38 },
      { name: 'น้ำดื่มเนสท์เล่', price: 10 },
      { name: 'ขนมขบเคี้ยว เลย์', price: 20 },
    ],
    notes: 'ชำระด้วยเงินสด ได้รับเงินทอน 55 บาท',
  },
  {
    name: 'ตัวอย่าง 2: บิล Tops (บัตรเครดิต)',
    merchant: 'Tops Supermarket',
    amount: 1240.0,
    category: 'ของใช้ในบ้าน',
    paymentMethod: 'credit_card' as const,
    date: new Date().toISOString().split('T')[0],
    time: '18:50',
    items: [
      { name: 'เนื้อหมูสันนอก 1 กก.', price: 195 },
      { name: 'ไข่ไก่เบอร์ 1 (30 ฟอง)', price: 145 },
      { name: 'ข้าวหอมมะลิ 5 กก.', price: 240 },
      { name: 'น้ำยาซักผ้า บรีส', price: 180 },
      { name: 'ผักสดและผลไม้', price: 480 },
    ],
    notes: 'รูดบัตรเครดิต KBank Visa ****1234',
  },
  {
    name: 'ตัวอย่าง 3: สลิปโอนเงินธนาคาร (SCB EASY)',
    merchant: 'นิติบุคคล คอนโดมิเนียม',
    amount: 4500.0,
    category: 'ค่าบริการ/บิล',
    paymentMethod: 'transfer' as const,
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    items: [{ name: 'ค่าส่วนกลางคอนโดประจำงวด', price: 4500 }],
    notes: 'โอนผ่านบัญชี SCB EASY ไปยัง KBANK',
  },
  {
    name: 'ตัวอย่าง 4: สลิปสแกนพร้อมเพย์ (PromptPay QR)',
    merchant: 'ร้านชาบู & ปิ้งย่างริมสวน',
    amount: 399.0,
    category: 'อาหารและเครื่องดื่ม',
    paymentMethod: 'transfer' as const,
    date: new Date().toISOString().split('T')[0],
    time: '19:40',
    items: [{ name: 'บุฟเฟต์ชาบูหมูรวมมิตร', price: 399 }],
    notes: 'สแกน QR Code พร้อมเพย์ แม่มณี หน้าร้าน',
  },
];

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onParsedResult,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle file selection from disk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setError(null);
      scanReceiptWithAI(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setError(null);
      scanReceiptWithAI(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Start Live Camera
  const startCamera = async () => {
    try {
      setError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setIsCameraActive(false);
      setError('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง หรือใช้วิธีอัปโหลดรูปภาพแทน');
    }
  };

  // Capture frame from camera
  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    // Stop stream
    stopCamera();
    setImagePreview(dataUrl);
    scanReceiptWithAI(dataUrl, 'image/jpeg');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Call Server-Side Gemini API
  const scanReceiptWithAI = async (base64Image: string, mimeType: string) => {
    setIsScanning(true);
    setError(null);

    try {
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Scan failed (${res.status})`);
      }

      const resData = await res.json();
      if (!resData.success || !resData.data) {
        throw new Error('ไม่สามารถดึงข้อมูลใบเสร็จได้ กรุณาลองใหม่อีกครั้ง');
      }

      const result: ScannedReceiptResult = resData.data;
      onParsedResult(result, base64Image);
      onClose();
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ใบเสร็จด้วย AI');
    } finally {
      setIsScanning(false);
    }
  };

  // Apply a sample receipt
  const applySample = (sample: typeof SAMPLE_RECEIPTS[0]) => {
    // Generate a placeholder receipt canvas image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(sample.merchant, 20, 40);
      ctx.font = '14px sans-serif';
      ctx.fillText(`วันที่: ${sample.date}  เวลา: ${sample.time}`, 20, 70);
      ctx.fillText(`วิธีชำระ: ${sample.paymentMethod === 'cash' ? 'เงินสด' : 'บัตรเครดิต'}`, 20, 95);
      ctx.fillText('--------------------------------------', 20, 120);
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#DC2626';
      ctx.fillText(`ยอดรวม: ฿${sample.amount.toFixed(2)}`, 20, 160);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#78716C';
      ctx.fillText(sample.notes, 20, 195);
    }
    const sampleDataUrl = canvas.toDataURL('image/png');
    onParsedResult(sample, sampleDataUrl);
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    setImagePreview(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                  ถ่ายรูปบิล แล้วกรอกข้อมูลด้วย AI
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-stone-500">
                ถ่ายภาพใบเสร็จหรือสลิป AI จะแยกยอดเงิน ร้านค้า และช่องทางชำระเงินให้อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Live View Mode */}
        {isCameraActive ? (
          <div className="mt-4 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-8 inset-y-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-white/80 text-xs bg-black/40 px-2 py-1 rounded-md">
                  จัดใบเสร็จให้อยู่ในกรอบ
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={captureCameraFrame}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>ถ่ายภาพตอนนี้</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                isScanning
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-stone-200 hover:border-red-400 hover:bg-red-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {isScanning ? (
                <div className="py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="font-semibold text-stone-800 text-sm">
                    AI กำลังอ่านและวิเคราะห์ใบเสร็จ...
                  </p>
                  <p className="text-xs text-stone-500">
                    กำลังดึงข้อมูลร้านค้า, ยอดรวม, วันที่, และตรวจจับวิธีชำระ (เงินสด/บัตรเครดิต)
                  </p>
                </div>
              ) : imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded receipt"
                    className="max-h-48 mx-auto rounded-xl object-contain shadow-xs border border-stone-200"
                  />
                  <p className="text-xs text-stone-500">
                    คลิกเพื่อเปลี่ยนรูปภาพใหม่
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">
                      ลากรูปภาพใบเสร็จมาวางที่นี่ หรือคลิกเพื่ออัปโหลด
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      รองรับไฟล์ภาพ JPG, PNG, WEBP หรือสลิปธนาคาร
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Button */}
            {!isScanning && (
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-red-600" />
                <span>เปิดกล้องถ่ายรูปใบเสร็จโดยตรง</span>
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Demo Sample Receipts for Instant 1-Click Testing */}
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-semibold text-stone-700 mb-2">
                หรือทดลองด้วยตัวอย่างบิลสำเร็จรูปทันที:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {SAMPLE_RECEIPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySample(sample)}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-red-400 hover:bg-red-50/30 text-left text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-800 group-hover:text-red-600 truncate">
                      <Store className="w-3 h-3 shrink-0 text-stone-400" />
                      <span className="truncate">{sample.merchant}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-bold text-red-600">
                        ฿{sample.amount}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {sample.paymentMethod === 'cash'
                          ? 'เงินสด'
                          : sample.paymentMethod === 'credit_card'
                          ? 'บัตร'
                          : 'โอน/พร้อมเพย์'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
