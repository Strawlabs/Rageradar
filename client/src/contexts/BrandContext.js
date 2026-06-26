import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BrandContext = createContext();

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

export const BrandProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [analyzedBrands, setAnalyzedBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastFetchedUserId = useRef(null);

  // Fetch analyzed brands when user changes
  useEffect(() => {
    if (currentUser) {
      // Only fetch if this is a different user or first time
      if (lastFetchedUserId.current !== currentUser.uid) {
        console.log('🔍 BrandContext: Fetching brands for user (user changed)');
        lastFetchedUserId.current = currentUser.uid;
        fetchAnalyzedBrands();
      }
    } else {
      setAnalyzedBrands([]);
      setCurrentBrand(null);
      lastFetchedUserId.current = null;
    }
  }, [currentUser]);

  const sanitizeAndDeduplicateBrands = (brandsList) => {
    const seen = new Set();
    return (brandsList || [])
      .filter(b => b && b.brandName && b.brandName.trim() !== '')
      .filter(b => {
        const normalized = b.brandName.trim().toLowerCase();
        if (seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
  };

  const fetchAnalyzedBrands = async (forceRefresh = false) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await axios.get('/api/brands', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': forceRefresh ? 'no-cache' : 'default'
        }
      });
      
      const rawBrands = response.data || [];
      // Sort rawBrands by createdAt desc (or analysisDate desc)
      rawBrands.sort((a, b) => new Date(b.createdAt || b.analysisDate || 0) - new Date(a.createdAt || a.analysisDate || 0));
      const brands = sanitizeAndDeduplicateBrands(rawBrands);
      console.log('🔍 BrandContext: Fetched brands (after deduplication):', brands.length, forceRefresh ? '(forced refresh)' : '');
      
      // Use only real brands from API - no demo data
      setAnalyzedBrands(brands);
      
      // Update current brand if it exists in the new data
      if (currentBrand) {
        const updatedCurrentBrand = brands.find(b => b.brandName.trim().toLowerCase() === currentBrand.brandName.trim().toLowerCase());
        if (updatedCurrentBrand) {
          console.log('🔄 BrandContext: Updating current brand with fresh data');
          setCurrentBrand(updatedCurrentBrand);
        }
      }
      
      // Set current brand to the most recent one if none selected
      if (!currentBrand && brands.length > 0) {
        console.log('🎯 BrandContext: Setting current brand:', brands[0]);
        setCurrentBrand(brands[0]);
      }
    } catch (error) {
      console.error('Error fetching analyzed brands:', error);
      setAnalyzedBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const addAnalyzedBrand = (brandData) => {
    if (!brandData || !brandData.brandName || brandData.brandName.trim() === '') return;
    console.log('🔄 BrandContext: Adding/updating brand:', brandData.brandName);
    setAnalyzedBrands(prev => {
      // Remove existing brand with same name (case-insensitive) and add new one at the beginning
      const filtered = prev.filter(b => b.brandName.trim().toLowerCase() !== brandData.brandName.trim().toLowerCase());
      const updated = [brandData, ...filtered];
      console.log('📊 BrandContext: Updated brands list:', updated.length);
      return updated;
    });
    setCurrentBrand(brandData);
    console.log('✅ BrandContext: Set current brand to:', brandData.brandName);
  };

  const selectBrand = (brand) => {
    setCurrentBrand(brand);
  };

  const removeBrand = async (brandName) => {
    if (!currentUser) return;
    
    try {
      console.log('🗑️ BrandContext: Removing brand:', brandName);
      
      // First, update the local state immediately for better UX
      setAnalyzedBrands(prev => {
        const filtered = prev.filter(b => b.brandName !== brandName);
        console.log('📊 BrandContext: Brands after local removal:', filtered.length);
        return filtered;
      });
      
      // If removed brand was current, select another one
      if (currentBrand?.brandName === brandName) {
        const remaining = analyzedBrands.filter(b => b.brandName !== brandName);
        setCurrentBrand(remaining.length > 0 ? remaining[0] : null);
        console.log('🎯 BrandContext: Updated current brand after deletion');
      }
      
      // Try to delete from API (this might fail for demo data, which is fine)
      try {
        const token = await currentUser.getIdToken();
        await axios.delete(`/api/brands/${encodeURIComponent(brandName)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ BrandContext: Successfully deleted from API');
      } catch (apiError) {
        // If it's a demo brand or API error, just log it but don't fail the operation
        console.log('ℹ️ BrandContext: Could not delete from API (likely demo data):', apiError.response?.status);
      }
      
    } catch (error) {
      console.error('❌ BrandContext: Error removing brand:', error);
      // Revert the local state change if there was an error
      fetchAnalyzedBrands(true);
    }
  };

  const value = {
    analyzedBrands,
    currentBrand,
    loading,
    fetchAnalyzedBrands,
    addAnalyzedBrand,
    selectBrand,
    removeBrand,
    refreshBrandData: () => fetchAnalyzedBrands(true)
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};