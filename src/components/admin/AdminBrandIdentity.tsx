import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useBrand } from '../../context/BrandContext';
import { BrandConfig } from '../../types';
import { DEFAULT_BRAND_CONFIG } from '../../data/initialData';
import {
  getDraftBrandConfig,
  saveDraftBrandConfig,
  publishBrandConfig,
  restoreBrandDefaults
} from '../../services/dataService';
import {
  Palette,
  Sparkles,
  Save,
  Globe,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Type,
  Layout,
  Layers,
  Image,
  Undo,
  X
} from 'lucide-react';

export const AdminBrandIdentity: React.FC = () => {
  const { isRTL } = useLanguage();
  const { staffUser, isOwner, hasPermission } = useAuth();
  const { brandConfig, previewConfig, isPreviewMode, setPreviewConfig, refreshBrandConfig } = useBrand();

  const [formConfig, setFormConfig] = useState<BrandConfig>(brandConfig);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Active section accordion or tab
  const [activeSection, setActiveSection] = useState<'colors' | 'identity' | 'logos' | 'typography' | 'components'>('colors');

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canManageBranding = isOwner || hasPermission('branding.manage');

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    const loadDraft = async () => {
      setLoading(true);
      try {
        const draft = await getDraftBrandConfig();
        setFormConfig(draft || brandConfig);
      } catch (e) {
        setFormConfig(brandConfig);
      } finally {
        setLoading(false);
      }
    };
    loadDraft();
  }, [brandConfig]);

  const handleColorChange = (key: keyof BrandConfig, value: string) => {
    setFormConfig((prev) => {
      const updated = { ...prev, [key]: value };
      if (isPreviewMode) {
        setPreviewConfig(updated);
      }
      return updated;
    });
  };

  const handleInputChange = (key: keyof BrandConfig, value: any) => {
    setFormConfig((prev) => {
      const updated = { ...prev, [key]: value };
      if (isPreviewMode) {
        setPreviewConfig(updated);
      }
      return updated;
    });
  };

  const togglePreviewMode = () => {
    if (isPreviewMode) {
      setPreviewConfig(null);
    } else {
      setPreviewConfig(formConfig);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await saveDraftBrandConfig(formConfig, staffUser?.email || 'admin');
      showToast('success', isRTL ? 'تم حفظ مسودة الهوية البصرية بنجاح' : 'Brand identity draft saved');
    } catch (err: any) {
      showToast('error', err.message || 'Error saving draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!canManageBranding) {
      showToast('error', isRTL ? 'لا تملك صلاحية نشر الهوية البصرية' : 'Unauthorized to publish branding');
      return;
    }

    setPublishing(true);
    try {
      await publishBrandConfig(formConfig, staffUser?.email || 'admin');
      await refreshBrandConfig();
      setPreviewConfig(null);
      showToast(
        'success',
        isRTL
          ? 'تم نشر الهوية البصرية وتطبيقها فورياً على كامل الموقع العام!'
          : 'Brand identity published and applied live across the entire public site!'
      );
    } catch (err: any) {
      showToast('error', err.message || 'Error publishing branding');
    } finally {
      setPublishing(false);
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      const defaults = await restoreBrandDefaults(staffUser?.email || 'admin');
      setFormConfig(defaults);
      await refreshBrandConfig();
      setPreviewConfig(null);
      setConfirmReset(false);
      showToast('success', isRTL ? 'تمت استعادة ألوان وهوية ڤيلمورا الأصلية' : 'Restored default VELMORA branding');
    } catch (err: any) {
      showToast('error', err.message || 'Error resetting branding');
    }
  };

  const handleRestoreLastPublished = () => {
    setFormConfig(brandConfig);
    if (isPreviewMode) setPreviewConfig(brandConfig);
    showToast('success', isRTL ? 'تمت استعادة آخر نسخة منشورة' : 'Restored last published version');
  };

  const colorFields: { key: keyof BrandConfig; labelAr: string; labelEn: string; desc: string }[] = [
    { key: 'colorPageBg', labelAr: 'خلفية الصفحة الرئيسية', labelEn: 'Page Background', desc: 'Warm ivory background (#FAF7F2)' },
    { key: 'colorSurfaceBg', labelAr: 'خلفية البطاقات والأسطح', labelEn: 'Surface / Card Background', desc: 'Champagne beige surface (#F3ECE2)' },
    { key: 'colorPrimary', labelAr: 'اللون الرئيسي للعلامة', labelEn: 'Primary Brand Color', desc: 'Deep Charcoal (#1F1C18)' },
    { key: 'colorSecondary', labelAr: 'اللون الثانوي', labelEn: 'Secondary Color', desc: 'Muted Bronze Charcoal (#4A4337)' },
    { key: 'colorAccent', labelAr: 'لون التمييز (الذهب المطفأ)', labelEn: 'Accent Color', desc: 'Brushed Gold (#C5A265)' },
    { key: 'colorTextPrimary', labelAr: 'لون النصوص الأساسية', labelEn: 'Primary Typography', desc: 'High contrast text (#1F1C18)' },
    { key: 'colorTextSecondary', labelAr: 'لون النصوص الثانوية', labelEn: 'Secondary Typography', desc: 'Subtle captions text (#645C4E)' },
    { key: 'colorBorder', labelAr: 'لون الحواف والفواصل', labelEn: 'Border & Divider', desc: 'Warm border tone (#DECDB8)' },
    { key: 'colorBtnPrimaryBg', labelAr: 'خلفية الأزرار الرئيسية', labelEn: 'Primary Button Background', desc: 'CTA button fill (#1F1C18)' },
    { key: 'colorBtnPrimaryText', labelAr: 'نص الأزرار الرئيسية', labelEn: 'Primary Button Text', desc: 'Button text tone (#FAF7F2)' },
    { key: 'colorFooterBg', labelAr: 'خلفية التذييل (Footer)', labelEn: 'Footer Background', desc: 'Deep charcoal footer (#1C1A17)' },
    { key: 'colorFooterText', labelAr: 'نص التذييل (Footer)', labelEn: 'Footer Text', desc: 'Footer text tone (#EFEBE4)' }
  ];

  return (
    <div className="space-y-6 text-start">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xs animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header section with Action Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-white border border-[#DECDB8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18] flex items-center gap-2">
              <Palette className="w-6 h-6 text-[#C5A265]" />
              <span>{isRTL ? 'إدارة الهوية البصرية ونظام التصميم' : 'Brand Identity & Design Tokens'}</span>
            </h2>
            {isPreviewMode && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">
                {isRTL ? 'وضع المعاينة الفورية نشط' : 'Preview Mode Active'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            {isRTL
              ? 'تعديل ألوان العلامة، الشعارات، والخطوط ونشرها فورياً على الموقع دون إعادة بناء الكود'
              : 'Live database-backed design tokens: modify colors, logos, and typography dynamically'}
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Live Preview Toggle */}
          <button
            onClick={togglePreviewMode}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPreviewMode
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-[#F3ECE2] text-[#4A4337] border-[#DECDB8] hover:bg-[#EAE0D1]'
            }`}
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreviewMode ? (isRTL ? 'إيقاف المعاينة' : 'Exit Preview') : (isRTL ? 'معاينة التغييرات' : 'Live Preview')}</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="min-h-[40px] px-3.5 py-2 rounded-lg border border-[#DECDB8] bg-white text-[#4A4337] hover:bg-[#F3ECE2] text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {savingDraft ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-4 h-4 text-[#8A714C]" />}
            <span>{isRTL ? 'حفظ كمسودة' : 'Save Draft'}</span>
          </button>

          {/* Publish Changes */}
          {canManageBranding && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="min-h-[40px] px-5 py-2 rounded-lg bg-[#1F1C18] hover:bg-[#342E25] text-[#FAF7F2] text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {publishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#C5A265]" />}
              <span>{isRTL ? 'نشر الهوية للموقع العام' : 'Publish Live'}</span>
            </button>
          )}

          {/* Secondary menu options */}
          <button
            onClick={handleRestoreLastPublished}
            className="p-2 rounded-lg border border-[#DECDB8] text-[#736B5E] hover:text-[#1F1C18] hover:bg-[#F3ECE2]"
            title="Restore last published version"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={() => setConfirmReset(true)}
            className="p-2 rounded-lg border border-[#DECDB8] text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            title="Reset to brand defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs / Subsections */}
      <div className="flex items-center gap-2 border-b border-[#DECDB8] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSection('colors')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'colors' ? 'bg-[#1F1C18] text-[#FAF7F2]' : 'text-[#645C4E] hover:bg-[#F3ECE2]'
          }`}
        >
          <Palette className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'نظام الألوان (Color System)' : 'Color System'}</span>
        </button>

        <button
          onClick={() => setActiveSection('identity')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'identity' ? 'bg-[#1F1C18] text-[#FAF7F2]' : 'text-[#645C4E] hover:bg-[#F3ECE2]'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'بيانات وهوية العلامة' : 'Brand Copy & Meta'}</span>
        </button>

        <button
          onClick={() => setActiveSection('logos')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'logos' ? 'bg-[#1F1C18] text-[#FAF7F2]' : 'text-[#645C4E] hover:bg-[#F3ECE2]'
          }`}
        >
          <Image className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'الشعارات والأيقونات' : 'Logos & Favicon'}</span>
        </button>

        <button
          onClick={() => setActiveSection('typography')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'typography' ? 'bg-[#1F1C18] text-[#FAF7F2]' : 'text-[#645C4E] hover:bg-[#F3ECE2]'
          }`}
        >
          <Type className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'الخطوط والطباعة' : 'Typography'}</span>
        </button>

        <button
          onClick={() => setActiveSection('components')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeSection === 'components' ? 'bg-[#1F1C18] text-[#FAF7F2]' : 'text-[#645C4E] hover:bg-[#F3ECE2]'
          }`}
        >
          <Layout className="w-4 h-4 text-[#C5A265]" />
          <span>{isRTL ? 'المكونات والحواف' : 'Components Style'}</span>
        </button>
      </div>

      {/* SECTION 1: COLOR SYSTEM */}
      {activeSection === 'colors' && (
        <div className="space-y-6">
          {/* Real-time Visual Swatch Preview Box */}
          <div className="p-5 rounded-2xl border border-[#DECDB8] bg-white space-y-3">
            <span className="text-[10px] font-bold text-[#8A714C] uppercase tracking-wider block">
              {isRTL ? 'معاينة فورية لتناغم الألوان المحددة:' : 'Real-time Color Harmony Swatches:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {colorFields.map((field) => {
                const hexVal = (formConfig as any)[field.key] || '#000000';
                return (
                  <div key={field.key} className="p-2.5 rounded-xl border border-[#EAE0D3] bg-[#FAF7F2] space-y-2">
                    <div
                      className="w-full h-12 rounded-lg border border-black/10 shadow-inner flex items-center justify-center font-mono text-[10px] font-bold"
                      style={{
                        backgroundColor: hexVal,
                        color: ['colorPrimary', 'colorBtnPrimaryBg', 'colorFooterBg'].includes(field.key)
                          ? '#FAF7F2'
                          : '#1F1C18'
                      }}
                    >
                      {hexVal}
                    </div>
                    <div className="text-[11px] font-medium text-[#1F1C18] truncate" title={field.labelEn}>
                      {isRTL ? field.labelAr : field.labelEn}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Pickers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorFields.map((field) => {
              const hexVal = (formConfig as any)[field.key] || '#FFFFFF';

              return (
                <div
                  key={field.key}
                  className="p-4 rounded-xl bg-white border border-[#DECDB8] flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1F1C18] block">
                      {isRTL ? field.labelAr : field.labelEn}
                    </label>
                    <span className="text-[11px] text-[#736B5E] block">{field.desc}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Visual Color Input */}
                    <input
                      type="color"
                      value={hexVal.startsWith('#') && hexVal.length === 7 ? hexVal : '#C5A265'}
                      onChange={(e) => handleColorChange(field.key, e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#DECDB8] cursor-pointer p-0.5 bg-white"
                    />

                    {/* HEX Text Input */}
                    <input
                      type="text"
                      maxLength={7}
                      value={hexVal}
                      onChange={(e) => handleColorChange(field.key, e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono rounded border border-[#DECDB8] text-[#1F1C18] uppercase text-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: BRAND IDENTITY & COPY */}
      {activeSection === 'identity' && (
        <div className="p-6 rounded-2xl bg-white border border-[#DECDB8] space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'اسم العلامة بالعربية:' : 'Arabic Brand Name:'}
              </label>
              <input
                type="text"
                value={formConfig.brandNameAr}
                onChange={(e) => handleInputChange('brandNameAr', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs sm:text-sm text-[#1F1C18]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'اسم العلامة بالإنجليزية:' : 'English Brand Name:'}
              </label>
              <input
                type="text"
                value={formConfig.brandNameEn}
                onChange={(e) => handleInputChange('brandNameEn', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs sm:text-sm text-[#1F1C18]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'الشعار اللفظي بالعربية (Tagline):' : 'Arabic Tagline:'}
              </label>
              <input
                type="text"
                value={formConfig.taglineAr}
                onChange={(e) => handleInputChange('taglineAr', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'الشعار اللفظي بالإنجليزية (Tagline):' : 'English Tagline:'}
              </label>
              <input
                type="text"
                value={formConfig.taglineEn}
                onChange={(e) => handleInputChange('taglineEn', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4A4337] block">
              {isRTL ? 'عنوان نافذة المتصفح (Browser Tab Title):' : 'Browser Window Title:'}
            </label>
            <input
              type="text"
              value={formConfig.browserTitle}
              onChange={(e) => handleInputChange('browserTitle', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'نص حقوق الملكية بالعربية (Footer):' : 'Footer Copyright Text (Arabic):'}
              </label>
              <textarea
                rows={2}
                value={formConfig.footerCopyrightAr}
                onChange={(e) => handleInputChange('footerCopyrightAr', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'نص حقوق الملكية بالإنجليزية (Footer):' : 'Footer Copyright Text (English):'}
              </label>
              <textarea
                rows={2}
                value={formConfig.footerCopyrightEn}
                onChange={(e) => handleInputChange('footerCopyrightEn', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LOGOS & FAVICON */}
      {activeSection === 'logos' && (
        <div className="p-6 rounded-2xl bg-white border border-[#DECDB8] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'رابط الشعار الأساسي (Primary Logo URL):' : 'Primary Logo URL:'}
              </label>
              <input
                type="text"
                value={formConfig.logoPrimaryUrl}
                onChange={(e) => handleInputChange('logoPrimaryUrl', e.target.value)}
                placeholder="https://... or upload from Media Library"
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              />
              {formConfig.logoPrimaryUrl && (
                <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#DECDB8] flex items-center justify-center">
                  <img src={formConfig.logoPrimaryUrl} alt="Logo preview" className="max-h-12 object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'أيقونة المتصفح (Favicon URL):' : 'Favicon Icon URL:'}
              </label>
              <input
                type="text"
                value={formConfig.faviconUrl}
                onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                placeholder="https://... favicon.ico / png"
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              />
              {formConfig.faviconUrl && (
                <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#DECDB8] flex items-center justify-center">
                  <img src={formConfig.faviconUrl} alt="Favicon preview" className="w-6 h-6 object-contain" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4A4337] block">
              {isRTL ? 'ارتفاع الشعار بالبكسل في شريط التنقل:' : 'Logo Height in Navbar (Pixels):'}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={24}
                max={64}
                value={formConfig.logoHeightPx || 38}
                onChange={(e) => handleInputChange('logoHeightPx', parseInt(e.target.value, 10))}
                className="flex-1 accent-[#C5A265]"
              />
              <span className="font-mono text-xs font-bold text-[#1F1C18]">
                {formConfig.logoHeightPx || 38} px
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: TYPOGRAPHY */}
      {activeSection === 'typography' && (
        <div className="p-6 rounded-2xl bg-white border border-[#DECDB8] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'خط اللغة العربية:' : 'Arabic Font Family:'}
              </label>
              <select
                value={formConfig.fontArabic}
                onChange={(e) => handleInputChange('fontArabic', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="Tajawal">Tajawal (Default - Modern Luxury)</option>
                <option value="Amiri">Amiri (Traditional Naskh)</option>
                <option value="Cairo">Cairo (Modern Geometric)</option>
                <option value="Almarai">Almarai (Clean Contemporary)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'خط اللغة الإنجليزية:' : 'English Font Family:'}
              </label>
              <select
                value={formConfig.fontEnglish}
                onChange={(e) => handleInputChange('fontEnglish', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Default)</option>
                <option value="Cinzel">Cinzel (Classic Serif Luxury)</option>
                <option value="Marcellus">Marcellus (Editorial Serif)</option>
                <option value="Playfair Display">Playfair Display (High Fashion)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'مقياس العناوين (Heading Scale):' : 'Heading Scale:'}
              </label>
              <select
                value={formConfig.headingScale}
                onChange={(e) => handleInputChange('headingScale', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="compact">Compact</option>
                <option value="classic">Classic (Standard)</option>
                <option value="prominent">Prominent (Large Editorial)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'مقياس نصوص الفقرات (Body Scale):' : 'Body Scale:'}
              </label>
              <select
                value={formConfig.bodyScale}
                onChange={(e) => handleInputChange('bodyScale', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="small">Small</option>
                <option value="standard">Standard</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: COMPONENTS STYLE */}
      {activeSection === 'components' && (
        <div className="p-6 rounded-2xl bg-white border border-[#DECDB8] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'استدارة الحواف (Border Radius):' : 'Border Radius Tokens:'}
              </label>
              <select
                value={formConfig.borderRadius}
                onChange={(e) => handleInputChange('borderRadius', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="none">Sharp / Zero Radius (0px)</option>
                <option value="sm">Subtle (rounded-sm - 4px)</option>
                <option value="md">Balanced (rounded-md - 8px)</option>
                <option value="lg">Soft Editorial (rounded-xl - 14px)</option>
                <option value="full">Pill / Circular (rounded-full)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'تصميم الأزرار (Button Style):' : 'Button Style:'}
              </label>
              <select
                value={formConfig.buttonStyle}
                onChange={(e) => handleInputChange('buttonStyle', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="flat">Minimal Flat</option>
                <option value="elevated">Soft Shadow Elevated</option>
                <option value="bordered">Outlined Bordered</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'طراز البطاقات (Card Style):' : 'Card Style:'}
              </label>
              <select
                value={formConfig.cardStyle}
                onChange={(e) => handleInputChange('cardStyle', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="bordered">Refined Bordered</option>
                <option value="shadowed">Gentle Shadow</option>
                <option value="flat">Flat Surface</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4337] block">
                {isRTL ? 'التباعد بين الأقسام (Section Spacing):' : 'Section Spacing:'}
              </label>
              <select
                value={formConfig.sectionSpacing}
                onChange={(e) => handleInputChange('sectionSpacing', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DECDB8] text-xs text-[#1F1C18]"
              >
                <option value="compact">Compact (py-12)</option>
                <option value="comfortable">Comfortable (py-20)</option>
                <option value="spacious">Spacious Editorial (py-28)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET MODAL */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-[#FAF7F2] rounded-2xl border border-rose-300 p-6 space-y-4 text-start shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-serif text-lg font-semibold text-[#1F1C18]">
                {isRTL ? 'استعادة إعدادات وألوان ڤيلمورا الأصلية' : 'Restore VELMORA Defaults'}
              </h4>
            </div>
            <p className="text-xs text-[#645C4E] leading-relaxed">
              {isRTL
                ? 'هل أنت متأكد من استعادة كافة الألوان والخطوط والشعارات الافتراضية للعلامة التجارية؟ سيتم تطبيقها فورياً على الموقع.'
                : 'Are you sure you want to restore all original VELMORA design tokens and colors?'}
            </p>
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-xs text-[#4A4337] rounded-lg border border-[#DECDB8] hover:bg-[#F3ECE2]"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleRestoreDefaults}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                {isRTL ? 'نعم، استعادة الافتراضي' : 'Restore Defaults'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
