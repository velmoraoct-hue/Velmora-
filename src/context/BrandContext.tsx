import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrandConfig } from '../types';
import { DEFAULT_BRAND_CONFIG } from '../data/initialData';
import { getPublishedBrandConfig } from '../services/dataService';

interface BrandContextType {
  brandConfig: BrandConfig;
  previewConfig: BrandConfig | null;
  activeConfig: BrandConfig;
  isPreviewMode: boolean;
  setPreviewConfig: (config: BrandConfig | null) => void;
  refreshBrandConfig: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishedConfig, setPublishedConfig] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG);
  const [previewConfig, setPreviewConfig] = useState<BrandConfig | null>(null);

  const activeConfig = previewConfig || publishedConfig;
  const isPreviewMode = previewConfig !== null;

  const refreshBrandConfig = useCallback(async () => {
    try {
      const cfg = await getPublishedBrandConfig();
      setPublishedConfig(cfg);
    } catch (e) {
      console.warn('Could not load published brand config:', e);
    }
  }, []);

  useEffect(() => {
    refreshBrandConfig();
  }, [refreshBrandConfig]);

  // Apply CSS custom properties dynamically to :root
  useEffect(() => {
    const root = document.documentElement;

    // Apply color variables
    root.style.setProperty('--color-page-bg', activeConfig.colorPageBg);
    root.style.setProperty('--color-surface-bg', activeConfig.colorSurfaceBg);
    root.style.setProperty('--color-primary', activeConfig.colorPrimary);
    root.style.setProperty('--color-secondary', activeConfig.colorSecondary);
    root.style.setProperty('--color-accent', activeConfig.colorAccent);
    root.style.setProperty('--color-text-primary', activeConfig.colorTextPrimary);
    root.style.setProperty('--color-text-secondary', activeConfig.colorTextSecondary);
    root.style.setProperty('--color-border', activeConfig.colorBorder);
    root.style.setProperty('--color-btn-primary-bg', activeConfig.colorBtnPrimaryBg);
    root.style.setProperty('--color-btn-primary-text', activeConfig.colorBtnPrimaryText);
    root.style.setProperty('--color-footer-bg', activeConfig.colorFooterBg);
    root.style.setProperty('--color-footer-text', activeConfig.colorFooterText);

    // Approved VELMORA Brand Tokens
    root.style.setProperty('--color-burgundy', activeConfig.colorBurgundy || '#542238');
    root.style.setProperty('--color-rose-gold', activeConfig.colorRoseGold || '#C58B83');
    root.style.setProperty('--color-champagne-gold', activeConfig.colorChampagneGold || '#C5A265');
    root.style.setProperty('--color-ivory', activeConfig.colorIvory || '#FAF5F0');
    root.style.setProperty('--color-dusty-mauve', activeConfig.colorDustyMauve || '#B69AA8');
    root.style.setProperty('--color-dark-neutral', activeConfig.colorDarkNeutral || '#1F1C18');

    // Dynamic browser title
    if (activeConfig.browserTitle) {
      document.title = activeConfig.browserTitle;
    }

    // Dynamic favicon
    if (activeConfig.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = activeConfig.faviconUrl;
    }
  }, [activeConfig]);

  return (
    <BrandContext.Provider
      value={{
        brandConfig: publishedConfig,
        previewConfig,
        activeConfig,
        isPreviewMode,
        setPreviewConfig,
        refreshBrandConfig
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
