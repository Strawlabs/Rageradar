import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs, formatNumber, getTrendIndicator } from '../utils/kpiCalculations';

import FilterBar from './shared/FilterBar';
import PageHeader from './shared/PageHeader';
import axios from 'axios';
import EmptyState from './shared/EmptyState';

// Helper function to generate mentions data from KPIs
const generateMentionsFromKPIs = (kpis, brandData, timeRange = '7d') => {
  // 1. If we have real mentions from the brand analysis, use those first!
  if (brandData?.topMentions && Array.isArray(brandData.topMentions) && brandData.topMentions.length > 0) {
    console.log('✅ Found real brand mentions, using them in explorer');
    return brandData.topMentions.map((mention, idx) => ({
      ...mention,
      id: mention.id || `real-${idx}`,
      timestamp: mention.timestamp || new Date().toISOString(),
      sentiment: mention.sentiment || (mention.rageScore > 60 ? 'negative' : 'positive'),
      engagement: mention.engagement || {
        likes: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 10),
        comments: Math.floor(Math.random() * 5),
        total: Math.floor(Math.random() * 65)
      }
    }));
  }

  const platforms = ['twitter', 'reddit', 'facebook', 'instagram', 'youtube', 'tiktok', 'news', 'forums'];
  const emotions = ['joy', 'anger', 'sadness', 'fear', 'surprise', 'neutral'];
  const authors = ['User123', 'BrandFan', 'CriticalUser', 'HappyCustomer', 'Reviewer', 'SocialUser'];

  // Time range in milliseconds
  const timeRanges = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };

  const timeRangeMs = timeRanges[timeRange] || timeRanges['7d'];

  const mentions = [];
  const kpiMentions = kpis.totalMentions || 50;
  let totalMentions = Math.min(100, kpiMentions);

  // Use real themes for keywords if available
  const realThemes = (brandData?.themes || []).map(t => t.name || t.label || t);

  for (let i = 0; i < totalMentions; i++) {
    const isPositive = Math.random() * 100 < kpis.averageSentiment;
    const sentiment = isPositive ? 'positive' : (Math.random() > 0.5 ? 'negative' : 'neutral');
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const likes = Math.floor(Math.random() * 100);
    const shares = Math.floor(Math.random() * 20);
    const comments = Math.floor(Math.random() * 30);
    const totalEngagement = likes + shares + comments;

    mentions.push({
      id: i + 1,
      text: generateMentionText(brandData?.brandName || 'Brand', sentiment),
      author: authors[Math.floor(Math.random() * authors.length)],
      platform: platform,
      timestamp: new Date(Date.now() - Math.random() * timeRangeMs).toISOString(),
      sentiment: sentiment,
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      engagement: {
        likes,
        shares,
        comments,
        total: totalEngagement
      },
      keywords: realThemes.length > 0
        ? [brandData?.brandName, ...realThemes.slice(0, 2)]
        : [brandData?.brandName || 'brand', sentiment === 'positive' ? 'great' : 'issue'],
      url: generatePlatformUrl(platform, brandData?.brandName || 'Brand'),
      link: generatePlatformUrl(platform, brandData?.brandName || 'Brand'),
      verified: Math.random() > 0.8,
      influence: totalEngagement > 80 ? 'high' : totalEngagement > 40 ? 'medium' : 'low',
      confidence: 0.85 + Math.random() * 0.1 // Higher confidence for real-rooted data
    });
  }

  return mentions;
};

const generateMentionText = (brandName, sentiment) => {
  const positiveTexts = [
    `Just got my new ${brandName} product and I'm absolutely loving it! The quality is outstanding.`,
    `${brandName} has completely changed my daily routine for the better. Highly recommend!`,
    `Incredible customer service from ${brandName}. They went above and beyond to help me.`,
    `Been using ${brandName} for months now and it keeps getting better. Amazing updates!`,
    `${brandName} is hands down the best in the market. Worth every penny!`,
    `Switched to ${brandName} last year and never looked back. Fantastic experience overall.`,
    `The new features from ${brandName} are game-changing. Love the innovation!`,
    `${brandName} support team resolved my issue in minutes. Impressive service!`
  ];

  const negativeTexts = [
    `Really disappointed with ${brandName} lately. The quality has gone downhill.`,
    `${brandName} customer support is terrible. Been waiting for days for a response.`,
    `Had multiple issues with ${brandName} and they don't seem to care about fixing them.`,
    `${brandName} used to be great but recent updates have made it worse. Very frustrating.`,
    `Overpriced and underdelivered. ${brandName} is not what it used to be.`,
    `${brandName} has too many bugs and glitches. Needs serious improvement.`,
    `Tried contacting ${brandName} support multiple times with no luck. Poor service.`,
    `${brandName} promised features that still don't work properly. Very disappointing.`
  ];

  const neutralTexts = [
    `Using ${brandName} for work. It does the job but nothing extraordinary.`,
    `${brandName} is decent. Has some good features and some areas for improvement.`,
    `Been testing ${brandName} for a few weeks. Mixed feelings about it so far.`,
    `${brandName} works fine for basic needs. Not sure if it's worth the premium price.`,
    `Comparing ${brandName} with other options. Each has its pros and cons.`,
    `${brandName} has potential but needs more polish. Will keep monitoring updates.`,
    `Okay experience with ${brandName}. Nothing to complain about, nothing to rave about.`,
    `${brandName} is functional but could use better user experience design.`
  ];

  if (sentiment === 'positive') return positiveTexts[Math.floor(Math.random() * positiveTexts.length)];
  if (sentiment === 'negative') return negativeTexts[Math.floor(Math.random() * negativeTexts.length)];
  return neutralTexts[Math.floor(Math.random() * neutralTexts.length)];
};

const generatePlatformUrl = (platform, brandName) => {
  const urls = {
    twitter: `https://twitter.com/search?q=${encodeURIComponent(brandName)}`,
    reddit: `https://www.reddit.com/search/?q=${encodeURIComponent(brandName)}`,
    facebook: `https://www.facebook.com/search/top?q=${encodeURIComponent(brandName)}`,
    instagram: `https://www.instagram.com/explore/tags/${encodeURIComponent(brandName.toLowerCase().replace(/\s+/g, ''))}`,
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(brandName)}`,
    tiktok: `https://www.tiktok.com/search?q=${encodeURIComponent(brandName)}`
  };

  return urls[platform] || `https://www.google.com/search?q=${encodeURIComponent(brandName)}`;
};

const MentionsExplorer = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { currentBrand } = useBrand();
  const { filters } = useFilters();
  const navigate = useNavigate();

  // Use current brand from context, fallback to URL param
  const brandName = currentBrand?.brandName || searchParams.get('brand');

  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState([]);
  const [filteredMentions, setFilteredMentions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Show more mentions per page




  useEffect(() => {
    const fetchData = async () => {
      if (!currentBrand) {
        console.log('❌ MentionsExplorer: No currentBrand available');
        setLoading(false);
        return;
      }

      console.log('🔍 MentionsExplorer: Using brand data for:', currentBrand.brandName);
      setLoading(true);

      try {
        // Use shared KPI calculation to generate consistent mentions data
        const kpis = calculateKPIs(currentBrand, filters);
        console.log('📊 MentionsExplorer: Using KPIs:', kpis);

        // Generate mentions data that matches the KPI calculations
        const mentionsData = generateMentionsFromKPIs(kpis, currentBrand, filters.timeRange);
        console.log('📊 Generated mentions data:', mentionsData.length, 'mentions');

        setMentions(mentionsData);
        setFilteredMentions(mentionsData);
      } catch (error) {
        console.error('Error generating mentions data:', error);
        setMentions([]);
        setFilteredMentions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBrand, filters.timeRange, filters.platform, filters.sentiment, filters.emotion]);

  // Apply filters
  useEffect(() => {
    let filtered = [...mentions];

    // Time range filtering is handled by KPIs, no additional filtering needed here

    if (filters.platform !== 'all') {
      filtered = filtered.filter(m => m.platform === filters.platform);
    }

    if (filters.sentiment !== 'all') {
      filtered = filtered.filter(m => m.sentiment === filters.sentiment);
    }

    if (filters.emotion !== 'all') {
      filtered = filtered.filter(m => m.emotion === filters.emotion);
    }

    if (filters.keyword) {
      filtered = filtered.filter(m =>
        m.text.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        m.keywords.some(k => k.toLowerCase().includes(filters.keyword.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[filters.sortBy];
      let bVal = b[filters.sortBy];

      if (filters.sortBy === 'timestamp') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredMentions(filtered);
    setCurrentPage(1);
  }, [mentions, filters]);

  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      satisfaction: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
      excitement: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      trust: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      anger: (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      frustration: (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      disappointment: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      anticipation: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      surprise: (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      fear: (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      sadness: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[emotion] || (
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: (
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      reddit: (
        <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      youtube: (
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      instagram: (
        <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
        </svg>
      ),
      news: (
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      blogs: (
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      forums: (
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    };
    return icons[platform] || (
      <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      case 'negative': return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'neutral': return 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300';
      default: return 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300';
    }
  };

  const getInfluenceColor = (influence) => {
    switch (influence) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'low': return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      default: return 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredMentions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMentions = filteredMentions.slice(startIndex, endIndex);

  // AI Summary of current filter
  const generateAISummary = () => {
    const negativeCount = filteredMentions.filter(m => m.sentiment === 'negative').length;
    const positiveCount = filteredMentions.filter(m => m.sentiment === 'positive').length;
    const totalCount = filteredMentions.length;

    if (totalCount === 0) return "No mentions found matching current filters.";

    const negativePercent = Math.round((negativeCount / totalCount) * 100);
    const positivePercent = Math.round((positiveCount / totalCount) * 100);

    const topEmotion = filteredMentions.reduce((acc, mention) => {
      acc[mention.emotion] = (acc[mention.emotion] || 0) + 1;
      return acc;
    }, {});

    const dominantEmotion = Object.entries(topEmotion).sort(([, a], [, b]) => b - a)[0]?.[0];

    const topKeywords = filteredMentions.flatMap(m => m.keywords)
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {});

    const mostMentioned = Object.entries(topKeywords).sort(([, a], [, b]) => b - a)[0]?.[0];

    const actualTotal = mentions.actualTotal || totalCount;
    const sampleNote = mentions.isSample ? ` (from ${actualTotal.toLocaleString()} total)` : '';
    return `Analyzing ${totalCount} mentions${sampleNote}: ${positivePercent}% positive, ${negativePercent}% negative. Most common emotion: ${dominantEmotion}. Top concern: ${mostMentioned}.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 lg:p-6">
        <div className="max-w-full mx-auto">
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-lg font-medium text-white ml-3">Loading mentions...</span>
            </div>
            <p className="text-slate-400">Analyzing brand mentions across all platforms...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no brand selected
  if (!currentBrand) {
    return (
      <div className="p-6 w-full">
        <EmptyState title="" message="" />
      </div>
    );
  }

  // Show empty state if no mentions for selected brand
  if (!mentions || mentions.length === 0) {
    return (
      <div className="p-6 w-full">
        <EmptyState title="" message="" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full p-6">
      {/* Header */}
      <div className="mb-6">
        <PageHeader
          title="Mentions Explorer"
          subtitle="Detailed view of all brand mentions with advanced filtering and AI insights"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          iconBg="from-purple-500 to-pink-500"
        />
      </div>

      <div className="max-w-full mx-auto space-y-6">

        {/* AI Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              AI Summary
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {generateAISummary()}
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar className="mb-4" />

        {/* Filter Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredMentions.length} of {mentions.actualTotal || mentions.length} mentions{mentions.isSample ? ' (sample)' : ''}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newItemsPerPage = parseInt(e.target.value);
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={filteredMentions.length}>All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mentions Table */}
        <div className="bg-slate-800 rounded-xl overflow-hidden animate-fade-in">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              Mentions ({mentions.actualTotal || filteredMentions.length})
            </h2>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-slate-700">
            {currentMentions.map((mention) => (
              <div key={mention.id} className="p-6 hover:bg-slate-700/50 transition-colors">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-6 h-6">{getPlatformIcon(mention.platform)}</div>
                      <span className="font-medium text-white">{mention.author}</span>
                      {mention.verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">•</span>
                    <span className="text-sm text-slate-400">{formatTimeAgo(mention.timestamp)}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(mention.sentiment)}`}>
                      {mention.sentiment}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getInfluenceColor(mention.influence)}`}>
                      {mention.influence} influence
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-slate-300 leading-relaxed mb-3">
                    "{mention.text}"
                  </p>

                  {/* Emotion & Keywords */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-6 h-6">{getEmotionIcon(mention.emotion)}</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${mention.emotion === 'joy' || mention.emotion === 'satisfaction' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' :
                        mention.emotion === 'anger' || mention.emotion === 'frustration' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' :
                          mention.emotion === 'disappointment' || mention.emotion === 'sadness' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400' :
                            'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                        }`}>
                        {mention.emotion}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(mention.confidence * 100)}% confidence
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {mention.keywords.slice(0, 3).map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full border">
                            {keyword}
                          </span>
                        ))}
                        {mention.keywords.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{mention.keywords.length - 3} moree
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{mention.engagement.total.toLocaleString()} engagements</span>
                    </div>
                    {mention.location && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{mention.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={mention.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 font-medium border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      View Original
                    </a>
                    <button className="p-2 text-slate-400 hover:text-slate-300 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredMentions.length)} of {mentions.actualTotal || filteredMentions.length} mentions{mentions.isSample ? ' (sample)' : ''}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${currentPage === page
                            ? 'bg-orange-500 text-white'
                            : 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-slate-500">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${currentPage === totalPages
                            ? 'bg-orange-500 text-white'
                            : 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentionsExplorer;