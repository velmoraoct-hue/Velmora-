import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { MediaAsset, MediaCategory } from '../../types';
import {
  getMediaAssets,
  uploadMediaFile,
  saveMediaAsset,
  deleteMediaAsset
} from '../../services/dataService';
import {
  Image as ImageIcon,
  Upload,
  Camera,
  Search,
  Filter,
  Trash2,
  Edit3,
  Eye,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Info,
  Maximize2,
  FileImage,
  Sparkles,
  Layers
} from 'lucide-react';

interface AdminMediaManagerProps {
  onSelectMedia?: (asset: MediaAsset) => void;
  selectionMode?: boolean;
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({
  onSelectMedia,
  selectionMode = false
}) => {
  const { isRTL } = useLanguage();
  const { staffUser } = useAuth();

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFailedFiles, setLastFailedFiles] = useState<File[] | null>(null);

  // New Upload configuration dialog
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('gallery');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');

  // Asset preview / edit modal
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Replace image state
  const [replacingAsset, setReplacingAsset] = useState<MediaAsset | null>(null);

  // Delete confirmation
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<MediaAsset | null>(null);

  // File input refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const categories: { id: MediaCategory | 'all'; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All Media' },
    { id: 'logos', labelAr: 'الشعارات والهوية', labelEn: 'Brand Logos' },
    { id: 'homepage', labelAr: 'الصفحة الرئيسية', labelEn: 'Homepage' },
    { id: 'services', labelAr: 'الخدمات والعلاجات', labelEn: 'Services' },
    { id: 'practitioners', labelAr: 'الكادر الطبي', labelEn: 'Practitioners' },
    { id: 'gallery', labelAr: 'معرض العيادة', labelEn: 'Clinic Gallery' },
    { id: 'offers', labelAr: 'العروض والباقات', labelEn: 'Offers' },
    { id: 'branches', labelAr: 'الفروع والتجهيزات', labelEn: 'Branches' },
    { id: 'icons', labelAr: 'الأيقونات والرموز', labelEn: 'Site Icons' },
    { id: 'other', labelAr: 'وسائط أخرى', labelEn: 'Other Assets' }
  ];

  const loadAssets = async () => {
    setLoading(true);
    try {
      const items = await getMediaAssets(selectedCategory === 'all' ? undefined : selectedCategory);
      setAssets(items || []);
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [selectedCategory]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)
    );

    if (fileArray.length === 0) {
      setUploadError(isRTL ? 'يرجى اختيار صور بصيغة JPG أو PNG أو WebP' : 'Please select JPEG, PNG, or WebP images');
      return;
    }

    setPendingFiles(fileArray);
    setUploadAltText(fileArray[0].name.replace(/\.[^/.]+$/, ''));
    setUploadError(null);
  };

  const handleStartUpload = async () => {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(5);
    setUploadError(null);

    const actor = staffUser?.email || 'admin';
    let completedCount = 0;

    try {
      for (const file of pendingFiles) {
        await uploadMediaFile(
          file,
          uploadCategory,
          uploadAltText || file.name,
          actor,
          uploadCaption,
          (pct) => {
            const overall = Math.round(((completedCount * 100) + pct) / pendingFiles.length);
            setUploadProgress(overall);
          }
        );
        completedCount++;
      }

      setPendingFiles([]);
      setUploadCaption('');
      setUploadAltText('');
      loadAssets();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || (isRTL ? 'فشل رفع الصور، يرجى المحاولة مرة أخرى' : 'Upload failed'));
      setLastFailedFiles(pendingFiles);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingAsset) return;

    setIsUploading(true);
    try {
      const updated = await uploadMediaFile(
        file,
        replacingAsset.category,
        replacingAsset.altText,
        staffUser?.email || 'admin',
        replacingAsset.caption
      );
      // Delete old asset record
      await deleteMediaAsset(replacingAsset.id, replacingAsset.storagePath, staffUser?.email || 'admin');
      setReplacingAsset(null);
      loadAssets();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to replace image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;
    setSavingEdit(true);
    try {
      const updated: MediaAsset = {
        ...editingAsset,
        altText: editAlt,
        caption: editCaption
      };
      await saveMediaAsset(updated, staffUser?.email || 'admin');
      setEditingAsset(null);
      loadAssets();
    } catch (err) {
      console.error('Error saving media edits:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteAsset) return;
    try {
      await deleteMediaAsset(confirmDeleteAsset.id, confirmDeleteAsset.storagePath, staffUser?.email || 'admin');
      setConfirmDeleteAsset(null);
      loadAssets();
    } catch (err) {
      console.error('Error deleting media:', err);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredAssets = assets.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.altText.toLowerCase().includes(q) ||
      (a.caption && a.caption.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 text-start">
      {/* Hidden file inputs for Mobile Gallery and Camera */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={(e) => handleFilesSelected(e.target.files)}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => handleFilesSelected(e.target.files)}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFile}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18] flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-[#C5A265]" />
            <span>{isRTL ? 'مكتبة الوسائط والصور (Mobile Media Manager)' : 'Media & Asset Manager'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            {isRTL
              ? 'رفع وإدارة صور العيادة والشعارات مباشرة من الهاتف أو الكاميرا مع ضغط تلقائي وحفظ آمن'
              : 'Upload, optimize, and manage high-resolution clinic photos from phone or desktop'}
          </p>
        </div>

        {/* Upload buttons (Touch-friendly, min 44px) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-[#DECDB8] bg-white text-[#4A4337] hover:bg-[#F3ECE2] text-xs font-medium cursor-pointer shadow-xs"
            title="Take Photo"
          >
            <Camera className="w-4 h-4 text-[#C5A265]" />
            <span className="hidden xs:inline">{isRTL ? 'التقاط صورة' : 'Camera'}</span>
          </button>

          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#C5A265]" />
            <span>{isRTL ? 'رفع من الجهاز' : 'Upload Images'}</span>
          </button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-white border border-[#C5A265] shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-[#1F1C18]">
            <span className="flex items-center gap-2 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A265]" />
              <span>{isRTL ? 'جارٍ ضغط ورفع الوسائط بدقة عالية...' : 'Optimizing & uploading media...'}</span>
            </span>
            <span className="font-mono font-bold text-[#8A714C]">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[#EAE0D3] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#C5A265] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error & Retry */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          {lastFailedFiles && (
            <button
              onClick={handleStartUpload}
              className="px-3 py-1 bg-rose-600 text-white rounded text-[11px] font-medium hover:bg-rose-700 cursor-pointer"
            >
              {isRTL ? 'إعادة المحاولة' : 'Retry'}
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === c.id
                  ? 'bg-[#1F1C18] text-[#FAF7F2] border-[#1F1C18]'
                  : 'bg-white text-[#4A4337] border-[#DECDB8] hover:bg-[#F3ECE2]'
              }`}
            >
              {isRTL ? c.labelAr : c.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-[#8A714C] absolute top-2.5 right-3 rtl:right-3 rtl:left-auto left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'البحث في الصور...' : 'Search media...'}
            className="w-full pr-9 pl-3 rtl:pr-9 rtl:pl-3 py-1.5 text-xs rounded-lg bg-white border border-[#DECDB8] text-[#1F1C18] focus:outline-none focus:ring-1 focus:ring-[#C5A265]"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-16 text-center text-[#736B5E] text-xs sm:text-sm flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C5A265]" />
          <span>{isRTL ? 'جارٍ تحميل مكتبة الوسائط...' : 'Loading media assets...'}</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#DECDB8] space-y-3">
          <FileImage className="w-12 h-12 text-[#DECDB8] mx-auto" />
          <p className="text-sm text-[#4A4337] font-medium">
            {isRTL ? 'لا توجد وسائط مسجلة في هذا القسم.' : 'No media assets found in this category.'}
          </p>
          <p className="text-xs text-[#736B5E]">
            {isRTL
              ? 'انقر على "رفع من الجهاز" أو "التقاط صورة" لإضافة صور جديدة.'
              : 'Upload from your device or use the camera to add high-resolution photos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative bg-white rounded-xl border border-[#DECDB8] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all hover:border-[#C5A265]"
            >
              {/* Image Preview Box */}
              <div
                onClick={() => (selectionMode ? onSelectMedia?.(asset) : setPreviewAsset(asset))}
                className="relative aspect-4/3 bg-[#FAF7F2] overflow-hidden cursor-pointer"
              >
                <img
                  src={asset.url}
                  alt={asset.altText || asset.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Category badge */}
                <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 bg-[#1F1C18]/80 text-[#FAF7F2] text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-mono uppercase">
                  {asset.category}
                </span>

                {/* Hover overlay icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Maximize2 className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Meta details */}
              <div className="p-2.5 space-y-1 text-start">
                <h5 className="text-xs font-semibold text-[#1F1C18] truncate" title={asset.name}>
                  {asset.name}
                </h5>
                <div className="flex items-center justify-between text-[10px] text-[#736B5E] font-mono">
                  <span>{formatFileSize(asset.sizeBytes)}</span>
                  {asset.width && asset.height && (
                    <span>{asset.width}×{asset.height}</span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-1.5 border-t border-[#F0E6D8] bg-[#FAF7F2] flex items-center justify-between text-xs">
                {selectionMode ? (
                  <button
                    onClick={() => onSelectMedia?.(asset)}
                    className="w-full py-1 text-center bg-[#1F1C18] text-white rounded text-[11px] font-medium cursor-pointer"
                  >
                    {isRTL ? 'اختيار' : 'Select'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingAsset(asset);
                        setEditAlt(asset.altText || '');
                        setEditCaption(asset.caption || '');
                      }}
                      className="p-1.5 text-[#5D5548] hover:text-[#1F1C18] hover:bg-[#EAE0D3] rounded cursor-pointer"
                      title="Edit metadata"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setReplacingAsset(asset);
                        replaceInputRef.current?.click();
                      }}
                      className="text-[10px] text-[#8A714C] hover:underline cursor-pointer"
                    >
                      {isRTL ? 'استبدال' : 'Replace'}
                    </button>

                    <button
                      onClick={() => setConfirmDeleteAsset(asset)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: PENDING UPLOAD CONFIGURATION */}
      {pendingFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-[#FAF7F2] rounded-2xl border border-[#DECDB8] shadow-2xl p-6 space-y-5 text-start">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <h3 className="font-serif text-lg font-medium text-[#1F1C18] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#C5A265]" />
                <span>{isRTL ? 'تأكيد رفع الصور وضبط التصنيف' : 'Configure Media Upload'}</span>
              </h3>
              <button onClick={() => setPendingFiles([])} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#DECDB8]">
                <span className="font-semibold text-[#1F1C18] block mb-1">
                  {isRTL ? `الملفات المحددة (${pendingFiles.length}):` : `Selected Files (${pendingFiles.length}):`}
                </span>
                <ul className="text-[11px] text-[#645C4E] space-y-0.5 max-h-24 overflow-y-auto">
                  {pendingFiles.map((f, i) => (
                    <li key={i} className="truncate">
                      • {f.name} ({formatFileSize(f.size)})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category picker */}
              <div className="space-y-1">
                <label className="font-semibold text-[#4A4337] block">
                  {isRTL ? 'تصنيف الوسائط في الموقع:' : 'Category Destination:'}
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#DECDB8] text-[#1F1C18]"
                >
                  {categories.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {isRTL ? c.labelAr : c.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alt text */}
              <div className="space-y-1">
                <label className="font-semibold text-[#4A4337] block">
                  {isRTL ? 'النص البديل (SEO & Accessibility Alt Text):' : 'Alt Text (SEO & Accessibility):'}
                </label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="e.g. VIP Consultation Suite Sheikh Zayed"
                  className="w-full p-2.5 rounded-lg bg-white border border-[#DECDB8] text-[#1F1C18]"
                />
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="font-semibold text-[#4A4337] block">
                  {isRTL ? 'وصف توضيحي أو تعليق (اختياري):' : 'Caption / Description (Optional):'}
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. Medical hydra station with ergonomic bed"
                  className="w-full p-2.5 rounded-lg bg-white border border-[#DECDB8] text-[#1F1C18]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingFiles([])}
                className="px-4 py-2 text-xs rounded-lg border border-[#DECDB8] hover:bg-[#F3ECE2]"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleStartUpload}
                disabled={isUploading}
                className="px-6 py-2 rounded-lg bg-[#1F1C18] text-[#FAF7F2] text-xs font-semibold hover:bg-[#342E25] cursor-pointer flex items-center gap-2"
              >
                {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isRTL ? 'بدء الرفع والتحسين' : 'Start Upload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE PREVIEW */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-2xl overflow-hidden shadow-2xl border border-[#DECDB8] p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
              <div className="space-y-0.5 text-start">
                <h4 className="font-serif text-base font-semibold text-[#1F1C18] truncate max-w-md">
                  {previewAsset.name}
                </h4>
                <p className="text-[11px] text-[#736B5E] font-mono">
                  {formatFileSize(previewAsset.sizeBytes)} • {previewAsset.mimeType} • Category: {previewAsset.category}
                </p>
              </div>
              <button onClick={() => setPreviewAsset(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-black/5 rounded-xl overflow-hidden flex items-center justify-center max-h-[55vh]">
              <img
                src={previewAsset.url}
                alt={previewAsset.altText || previewAsset.name}
                className="max-h-[55vh] max-w-full object-contain mx-auto"
              />
            </div>

            <div className="space-y-1.5 text-start text-xs text-[#5D5548]">
              <p><strong>Alt text:</strong> {previewAsset.altText || 'None'}</p>
              {previewAsset.caption && <p><strong>Caption:</strong> {previewAsset.caption}</p>}
            </div>

            <div className="pt-2 border-t border-[#E8DEC8] flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-2 text-xs bg-[#1F1C18] text-[#FAF7F2] rounded-lg"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT METADATA */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[#FAF7F2] rounded-2xl border border-[#DECDB8] shadow-2xl p-6 space-y-4 text-start">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
              <h4 className="font-serif text-base font-semibold text-[#1F1C18]">
                {isRTL ? 'تعديل بيانات الصورة' : 'Edit Image Metadata'}
              </h4>
              <button onClick={() => setEditingAsset(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#4A4337] block">Alt Text:</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#DECDB8] text-[#1F1C18]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#4A4337] block">Caption:</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#DECDB8] text-[#1F1C18]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingAsset(null)}
                className="px-4 py-2 text-xs border border-[#DECDB8] rounded-lg"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2 text-xs bg-[#1F1C18] text-[#FAF7F2] rounded-lg font-semibold flex items-center gap-2"
              >
                {savingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isRTL ? 'حفظ' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-[#FAF7F2] rounded-2xl border border-rose-300 p-6 space-y-4 text-start shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-serif text-lg font-semibold text-[#1F1C18]">
                {isRTL ? 'تأكيد حذف الصورة' : 'Confirm Media Deletion'}
              </h4>
            </div>
            <p className="text-xs text-[#645C4E] leading-relaxed">
              {isRTL
                ? `هل أنت متأكد من حذف الصورة "${confirmDeleteAsset.name}"؟ سيتم حذفها نهائياً من قاعدة البيانات والتخزين السحابي.`
                : `Are you sure you want to permanently delete "${confirmDeleteAsset.name}"? This action cannot be undone.`}
            </p>
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteAsset(null)}
                className="px-4 py-2 text-xs text-[#4A4337] rounded-lg border border-[#DECDB8] hover:bg-[#F3ECE2]"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                {isRTL ? 'نعم، حذف' : 'Delete Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
