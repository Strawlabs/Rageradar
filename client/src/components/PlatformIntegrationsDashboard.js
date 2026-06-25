import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Globe, 
  Cpu, 
  MessageSquare, 
  Youtube, 
  Award, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  List, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  ExternalLink, 
  CreditCard, 
  Sparkles, 
  Activity, 
  Check, 
  Settings, 
  Clock 
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Platform config with Lucide icons and colors
const PLATFORM_CONFIG = {
  reddit: { icon: MessageSquare, label: 'Reddit', color: '#FF4500', description: 'Posts, comments, subreddit mentions', keys: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_REFRESH_TOKEN'] },
  youtube: { icon: Youtube, label: 'YouTube', color: '#FF0000', description: 'Video comments and mentions', keys: ['YOUTUBE_API_KEY'] },
  producthunt: { icon: Award, label: 'Product Hunt', color: '#DA552F', description: 'Product posts and reviews', keys: ['PRODUCT_HUNT_TOKEN'] },
  appstore: { icon: Smartphone, label: 'App Stores', color: '#007AFF', description: 'iOS & Google Play reviews', keys: [] },
};

const SEARCH_PROVIDER_CONFIG = {
  googleCSE: { icon: Search, label: 'Google CSE', color: '#4285F4', description: 'Primary web search (27+ platforms)' },
  bing: { icon: Globe, label: 'Bing Search', color: '#008373', description: 'Fallback search provider' },
  serpapi: { icon: Cpu, label: 'SerpAPI', color: '#6C5CE7', description: 'Aggregator fallback provider' },
};

// Copy button component
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.2rem',
        color: copied ? '#10b981' : 'hsl(var(--muted-foreground) / 0.7)',
        transition: 'color 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// Setup item sub-component
function SetupItem({ title, status, steps, link, cost }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="setup-accordion-item" style={{
      ...styles.setupItem,
      borderColor: status ? 'rgba(16, 185, 129, 0.25)' : 'hsl(var(--border))',
      background: expanded ? 'hsl(var(--muted) / 0.12)' : 'hsl(var(--muted) / 0.04)',
    }}>
      <div
        style={styles.setupItemHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {status ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <Settings className="w-4 h-4 text-amber-500" style={{ animation: 'spin 12s linear infinite' }} />
          )}
          <strong>{title}</strong>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </div>
      {expanded && (
        <div style={styles.setupItemBody}>
          <ol style={styles.stepsList}>
            {steps.map((step, i) => (
              <li key={i} style={styles.stepItem}>
                <span style={{ color: 'hsl(var(--foreground))', marginRight: '0.25rem' }}>{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid hsl(var(--border) / 0.5)', paddingTop: '0.5rem' }}>
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" style={styles.setupLink}>
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Configure Online
              </a>
            ) : <span />}
            <span style={styles.costTag}>
              <CreditCard className="w-3.5 h-3.5 mr-1" /> {cost}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlatformIntegrationsDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanning, setScanning] = useState({});
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(user?.accessToken ? { 'Authorization': `Bearer ${user.accessToken}` } : {})
  }), [user?.accessToken]);

  // Fetch integration status
  const loadDashboardData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/integrations/status`, { headers: getHeaders() });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to fetch integration status');
    }

    try {
      const res = await fetch(`${API_BASE}/api/integrations/scan-history`, { headers: getHeaders() });
      const data = await res.json();
      setScanHistory(data.jobs || []);
    } catch (err) {
      // Scan history may fail silently
    }
  }, [getHeaders]);

  useEffect(() => {
    loadDashboardData().finally(() => setLoading(false));
  }, [loadDashboardData]);

  // Trigger a platform scan
  const triggerScan = async (platform) => {
    const brandName = prompt(`Enter brand name to scan on ${PLATFORM_CONFIG[platform]?.label || platform}:`);
    if (!brandName) return;

    setScanning(prev => ({ ...prev, [platform]: true }));
    setScanResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/integrations/scan/${platform}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ brandName })
      });
      const data = await res.json();

      if (data.success) {
        setScanResult({
          platform,
          brandName,
          mentionsFound: data.mentionsFound,
          durationMs: data.durationMs,
          mentions: data.mentions || []
        });
        // Reload history
        loadDashboardData();
      } else {
        setScanResult({ platform, error: data.error || data.details });
      }
    } catch (err) {
      setScanResult({ platform, error: err.message });
    } finally {
      setScanning(prev => ({ ...prev, [platform]: false }));
    }
  };

  // Trigger scan all
  const triggerScanAll = async () => {
    const brandName = prompt('Enter brand name to scan across all platforms:');
    if (!brandName) return;

    setScanning(prev => ({ ...prev, all: true }));
    setScanResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/integrations/scan-all`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ brandName })
      });
      const data = await res.json();

      if (data.success) {
        setScanResult({
          platform: 'all',
          brandName,
          summary: data.summary,
          durationMs: data.durationMs,
          totalAvailable: data.totalAvailable
        });
        // Reload history
        loadDashboardData();
      } else {
        setScanResult({ platform: 'all', error: data.error });
      }
    } catch (err) {
      setScanResult({ platform: 'all', error: err.message });
    } finally {
      setScanning(prev => ({ ...prev, all: false }));
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading configurations...</p>
      </div>
    );
  }

  const searchProviders = status?.searchProviders || {};
  const platformStatus = status?.platformIntegrations?.platforms || {};
  const summary = status?.summary || {};

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Activity className="w-6 h-6 text-indigo-500 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-4px' }} />
            Platform Integrations
          </h1>
          <p style={styles.subtitle}>
            Connect real-world data sources to power your brand intelligence pipeline
          </p>
        </div>
        <button
          onClick={triggerScanAll}
          disabled={scanning.all}
          className="integration-btn-glow"
          style={{
            ...styles.scanAllButton,
            '--btn-glow-color': 'rgba(108, 92, 231, 0.4)',
            opacity: scanning.all ? 0.6 : 1
          }}
        >
          {scanning.all ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
              Scanning...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
              Scan All Platforms
            </>
          )}
        </button>
      </div>

      {/* Status Banner */}
      <div style={{
        ...styles.statusBanner,
        background: summary.usingMockData
          ? 'linear-gradient(135deg, hsl(var(--destructive) / 0.08), hsl(var(--destructive) / 0.03))'
          : 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.08))',
        borderColor: summary.usingMockData ? 'hsl(var(--destructive) / 0.25)' : 'rgba(59, 130, 246, 0.25)'
      }}>
        <div style={styles.statusIcon}>
          {summary.usingMockData ? (
            <AlertTriangle className="w-6 h-6 text-amber-500 animate-pulse" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          )}
        </div>
        <div>
          <strong style={{ color: summary.usingMockData ? 'hsl(var(--destructive))' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {summary.usingMockData ? 'Sandbox / Mock Data Mode' : 'Production / Live Data Mode'}
          </strong>
          <p style={styles.statusText}>
            {summary.usingMockData
              ? 'No search API keys configured. The system is using realistic mock data. Add API keys below to connect to real data.'
              : `Connected to ${summary.searchProvidersConfigured?.length || 0} search providers and ${summary.platformsConfigured?.length || 0} platform integrations.`
            }
          </p>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Search Providers Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <Search className="w-5 h-5 text-indigo-500 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-3px' }} />
            Search Providers
          </h2>
          <div style={styles.headerDivider} />
        </div>
        <p style={styles.sectionSubtitle}>Web search engines that discover brand mentions across 27+ platforms</p>
        <div style={styles.grid3}>
          {Object.entries(SEARCH_PROVIDER_CONFIG).map(([key, config]) => {
            const providerStatus = searchProviders[key] || {};
            const isConfigured = providerStatus.configured;
            const ProviderIcon = config.icon;

            return (
              <div 
                key={key} 
                className="integration-card"
                style={{
                  ...styles.card,
                  '--hover-border-color': config.color,
                  borderLeft: `4px solid ${isConfigured ? config.color : 'hsl(var(--border))'}`
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={{ ...styles.cardIcon, color: config.color }}>
                    <ProviderIcon className="w-5 h-5" />
                  </span>
                  <span style={{
                    ...styles.badge,
                    background: isConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isConfigured ? '#10b981' : '#ef4444',
                    border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {isConfigured ? 'Connected' : 'Not Configured'}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{config.label}</h3>
                <p style={styles.cardDescription}>{config.description}</p>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {providerStatus.type && (
                    <span style={styles.typeTag}>{providerStatus.type}</span>
                  )}
                  {providerStatus.cost && (
                    <p style={styles.cardMeta}>{providerStatus.cost}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Integrations Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <Globe className="w-5 h-5 text-indigo-500 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-3px' }} />
            Native Platform Integrations
          </h2>
          <div style={styles.headerDivider} />
        </div>
        <p style={styles.sectionSubtitle}>Direct API connections for richer data from key platforms</p>
        <div style={styles.grid2}>
          {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
            const platStatus = platformStatus[key] || {};
            const isConfigured = platStatus.configured;
            const isScanning = scanning[key];
            const PlatformIcon = config.icon;

            return (
              <div 
                key={key} 
                className="integration-card"
                style={{
                  ...styles.platformCard,
                  '--hover-border-color': config.color,
                  borderColor: isConfigured ? `${config.color}33` : 'hsl(var(--border))'
                }}
              >
                <div style={styles.platformHeader}>
                  <div style={styles.platformInfo}>
                    <span style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${config.color}15`,
                      color: config.color
                    }}>
                      <PlatformIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 style={styles.platformName}>{config.label}</h3>
                      <p style={styles.platformDesc}>{config.description}</p>
                    </div>
                  </div>
                  <span style={{
                    ...styles.badge,
                    background: isConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isConfigured ? '#10b981' : '#ef4444',
                    border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {isConfigured ? 'Ready' : 'Needs API Key'}
                  </span>
                </div>

                <div style={styles.platformDetails}>
                  {platStatus.cost && <span style={styles.detailTag}><CreditCard className="w-3.5 h-3.5 mr-1" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }} /> {platStatus.cost}</span>}
                  {platStatus.rateLimit && <span style={styles.detailTag}><Clock className="w-3.5 h-3.5 mr-1" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }} /> {platStatus.rateLimit}</span>}
                  {platStatus.features && <span style={styles.detailTag}><Sparkles className="w-3.5 h-3.5 mr-1" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }} /> {platStatus.features}</span>}
                </div>

                {!isConfigured && config.keys.length > 0 && (
                  <div style={styles.keysList}>
                    <p style={styles.keysLabel}>Required environment variables:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {config.keys.map(k => (
                        <div key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'hsl(var(--muted))', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(var(--border) / 0.5)' }}>
                          <code style={{ ...styles.keyCode, margin: 0, padding: 0, background: 'none' }}>{k}</code>
                          <CopyButton text={k} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => triggerScan(key)}
                  disabled={!isConfigured || isScanning}
                  className="integration-btn-glow"
                  style={{
                    ...styles.scanButton,
                    '--btn-glow-color': config.color + '44',
                    background: isConfigured ? config.color : 'hsl(var(--muted))',
                    color: isConfigured ? '#fff' : 'hsl(var(--muted-foreground))',
                    opacity: isConfigured && !isScanning ? 1 : 0.5,
                    cursor: isConfigured && !isScanning ? 'pointer' : 'not-allowed',
                    marginTop: '0.5rem'
                  }}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                      Scan {config.label}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scan Result */}
      {scanResult && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <Activity className="w-5 h-5 text-indigo-500 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-3px' }} />
              Scan Result
            </h2>
            <div style={styles.headerDivider} />
          </div>
          {scanResult.error ? (
            <div style={styles.errorBanner} className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{scanResult.platform} scan failed: {scanResult.error}</span>
            </div>
          ) : (
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <h3 style={styles.resultTitle}>
                  {(() => {
                    const iconConfig = PLATFORM_CONFIG[scanResult.platform] || SEARCH_PROVIDER_CONFIG[scanResult.platform];
                    if (iconConfig && iconConfig.icon) {
                      const ResultIcon = iconConfig.icon;
                      return <ResultIcon className="w-5 h-5 mr-2 text-indigo-400" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }} />;
                    }
                    return <Globe className="w-5 h-5 mr-2 text-indigo-400" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }} />;
                  })()}
                  Scan Results for <strong>{scanResult.brandName}</strong>
                </h3>
                <span style={{ ...styles.resultMeta, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock className="w-3.5 h-3.5" />
                  {scanResult.durationMs ? `${(scanResult.durationMs / 1000).toFixed(2)}s` : '0s'}
                </span>
              </div>
              <div style={styles.resultStats}>
                <div style={styles.statBlock}>
                  <span style={styles.statValue}>
                    {scanResult.mentionsFound || scanResult.totalAvailable || 0}
                  </span>
                  <span style={styles.statLabel}>Mentions Found</span>
                </div>
                {scanResult.summary && (
                  <div style={styles.statBlock}>
                    <span style={styles.statValue}>
                      {Object.keys(scanResult.summary.byPlatform || {}).length}
                    </span>
                    <span style={styles.statLabel}>Platforms Scanned</span>
                  </div>
                )}
              </div>

              {/* Preview mentions */}
              {scanResult.mentions && scanResult.mentions.length > 0 && (
                <div style={styles.mentionsList}>
                  <h4 style={styles.mentionsTitle}>
                    <List className="w-4 h-4 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-3px' }} />
                    Recent Mentions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {scanResult.mentions.slice(0, 5).map((mention, i) => (
                      <div key={i} style={styles.mentionItem}>
                        <div style={styles.mentionHeader}>
                          <span style={styles.mentionPlatform}>{mention.platform}</span>
                          <span style={styles.mentionAuthor}>@{mention.author || 'unknown'}</span>
                        </div>
                        <p style={styles.mentionText}>
                          {(mention.text || mention.title || '').substring(0, 250)}
                          {(mention.text || '').length > 250 ? '...' : ''}
                        </p>
                        {mention.url && (
                          <a href={mention.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#6C5CE7', fontSize: '0.75rem', marginTop: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
                            View Original Post <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <List className="w-5 h-5 text-indigo-500 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-3px' }} />
              Recent Scans
            </h2>
            <div style={styles.headerDivider} />
          </div>
          <div style={styles.historyTable}>
            <div style={styles.tableHeader}>
              <span>Brand</span>
              <span>Type</span>
              <span>Status</span>
              <span>Results</span>
              <span>Duration</span>
              <span>Date</span>
            </div>
            {scanHistory.slice(0, 10).map((job, i) => (
              <div key={i} style={styles.tableRow}>
                <span style={{ ...styles.tableCell, fontWeight: 600 }}>{job.brand_name}</span>
                <span style={styles.tableCell}>
                  <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'hsl(var(--muted))', borderRadius: '4px', color: 'hsl(var(--muted-foreground))', fontWeight: 700 }}>
                    {job.scan_type}
                  </span>
                </span>
                <span style={styles.tableCell}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: job.status === 'completed' 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : job.status === 'failed' 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : 'rgba(245, 158, 11, 0.1)',
                    color: job.status === 'completed' 
                      ? '#10b981' 
                      : job.status === 'failed' 
                        ? '#ef4444' 
                        : '#f59e0b',
                    border: `1px solid ${job.status === 'completed' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : job.status === 'failed' 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : 'rgba(245, 158, 11, 0.2)'}`
                  }}>
                    {job.status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                    {job.status === 'failed' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {job.status !== 'completed' && job.status !== 'failed' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {job.status}
                  </span>
                </span>
                <span style={styles.tableCell}>{job.results_count || 0}</span>
                <span style={styles.tableCell}>
                  {job.duration_ms ? `${(job.duration_ms / 1000).toFixed(2)}s` : '-'}
                </span>
                <span style={{ ...styles.tableCell, color: 'hsl(var(--muted-foreground))' }}>
                  {new Date(job.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Setup Guide */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <Settings className="w-5 h-5 text-indigo-500 mr-2" style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-3px' }} />
            Setup Guide
          </h2>
          <div style={styles.headerDivider} />
        </div>
        <div style={styles.setupCard}>
          <p style={styles.setupText}>
            To connect real-world data sources, add the required API keys to your <code style={styles.inlineCode}>server/.env</code> file and restart the server.
          </p>
          <div style={styles.setupGrid}>
            <SetupItem
              title="Google Custom Search"
              status={searchProviders.googleCSE?.configured}
              steps={[
                'Go to console.cloud.google.com',
                'Enable Custom Search API',
                'Create API key & Search Engine ID',
                'Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID in .env'
              ]}
              link="https://programmablesearchengine.google.com"
              cost="Free: 100 queries/day, Paid: $5 per 1000"
            />
            <SetupItem
              title="Reddit API"
              status={platformStatus.reddit?.configured}
              steps={[
                'Go to reddit.com/prefs/apps',
                'Create a script application',
                'Get Client ID, Secret, and Refresh Token',
                'Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN'
              ]}
              link="https://www.reddit.com/prefs/apps"
              cost="Free (60 requests/min)"
            />
            <SetupItem
              title="YouTube Data API"
              status={platformStatus.youtube?.configured}
              steps={[
                'Go to console.cloud.google.com',
                'Enable YouTube Data API v3',
                'Create API key',
                'Set YOUTUBE_API_KEY in .env'
              ]}
              link="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
              cost="Free (10,000 units/day)"
            />
            <SetupItem
              title="Product Hunt API"
              status={platformStatus.producthunt?.configured}
              steps={[
                'Go to api.producthunt.com/v2/docs',
                'Create a developer application',
                'Get your API token',
                'Set PRODUCT_HUNT_TOKEN in .env'
              ]}
              link="https://api.producthunt.com/v2/docs"
              cost="Free"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: {
    padding: '5rem 2rem 2rem', // Clear sticky header nicely
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: 'hsl(var(--foreground))',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'hsl(var(--foreground))',
    margin: 0,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.95rem',
    marginTop: '0.35rem',
  },
  scanAllButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderRadius: '16px',
    border: '1px solid hsl(var(--border))',
    marginBottom: '2.5rem',
  },
  statusIcon: { display: 'flex', alignItems: 'center' },
  statusText: { color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', margin: '0.2rem 0 0' },
  errorBanner: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '12px',
    color: '#f87171',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  section: { marginBottom: '3rem' },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.25rem',
  },
  headerDivider: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, hsl(var(--border) / 0.5), transparent)',
  },
  sectionTitle: { fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--foreground))', margin: 0 },
  sectionSubtitle: { color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '0.15rem' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' },
  card: {
    background: 'hsl(var(--card))',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid hsl(var(--border))',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: { display: 'flex', alignItems: 'center' },
  badge: {
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  cardTitle: { fontSize: '1.15rem', fontWeight: 700, color: 'hsl(var(--foreground))', margin: 0 },
  cardDescription: { color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 },
  typeTag: {
    display: 'inline-block',
    padding: '0.15rem 0.4rem',
    background: 'hsl(var(--muted))',
    borderRadius: '4px',
    fontSize: '0.65rem',
    color: 'hsl(var(--muted-foreground))',
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  cardMeta: { color: 'hsl(var(--muted-foreground) / 0.7)', fontSize: '0.75rem', margin: 0, fontWeight: 500 },
  platformCard: {
    background: 'hsl(var(--card))',
    borderRadius: '20px',
    padding: '1.75rem',
    border: '1px solid hsl(var(--border))',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  platformHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  platformInfo: { display: 'flex', gap: '1rem', alignItems: 'center' },
  platformName: { fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--foreground))', margin: 0 },
  platformDesc: { color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', margin: '0.15rem 0 0' },
  platformDetails: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  detailTag: {
    padding: '0.25rem 0.6rem',
    background: 'hsl(var(--muted))',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
  },
  keysList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  keysLabel: { color: 'hsl(var(--muted-foreground) / 0.8)', fontSize: '0.75rem', margin: 0, fontWeight: 600 },
  keyCode: {
    fontSize: '0.75rem',
    color: '#d97706',
    fontFamily: 'monospace',
    fontWeight: 700,
  },
  scanButton: {
    width: '100%',
    padding: '0.7rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    background: 'hsl(var(--card))',
    borderRadius: '20px',
    padding: '1.75rem',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    borderBottom: '1px solid hsl(var(--border) / 0.5)',
    paddingBottom: '0.75rem',
  },
  resultTitle: { fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--foreground))', margin: 0 },
  resultMeta: { color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', fontWeight: 500 },
  resultStats: { display: 'flex', gap: '2.5rem', marginBottom: '1.5rem' },
  statBlock: { textAlign: 'left' },
  statValue: { display: 'block', fontSize: '2.25rem', fontWeight: 800, color: '#10b981', lineHeight: 1 },
  statLabel: { color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginTop: '0.35rem', display: 'block', fontWeight: 500 },
  mentionsList: { borderTop: '1px solid hsl(var(--border) / 0.5)', paddingTop: '1.25rem' },
  mentionsTitle: { fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: '0.75rem' },
  mentionItem: {
    padding: '1rem',
    background: 'hsl(var(--muted) / 0.3)',
    borderRadius: '12px',
    border: '1px solid hsl(var(--border) / 0.3)',
  },
  mentionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.4rem',
  },
  mentionPlatform: {
    padding: '0.15rem 0.5rem',
    background: 'rgba(108, 92, 231, 0.1)',
    borderRadius: '4px',
    fontSize: '0.65rem',
    color: '#a78bfa',
    textTransform: 'uppercase',
    fontWeight: 750,
  },
  mentionAuthor: { color: 'hsl(var(--muted-foreground) / 0.7)', fontSize: '0.75rem', fontWeight: 500 },
  mentionText: { color: 'hsl(var(--foreground))', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 },
  historyTable: { 
    background: 'hsl(var(--card))', 
    border: '1px solid hsl(var(--border))', 
    borderRadius: '16px', 
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr 1.25fr 0.8fr 0.8fr 1.5fr',
    padding: '0.85rem 1.25rem',
    background: 'hsl(var(--muted) / 0.5)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'hsl(var(--muted-foreground))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid hsl(var(--border))',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr 1.25fr 0.8fr 0.8fr 1.5fr',
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid hsl(var(--border) / 0.5)',
    fontSize: '0.85rem',
    color: 'hsl(var(--foreground))',
    alignItems: 'center',
  },
  tableCell: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  setupCard: {
    background: 'hsl(var(--card))',
    borderRadius: '20px',
    padding: '1.75rem',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  setupText: { color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 },
  inlineCode: {
    background: 'hsl(var(--muted))',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#d97706',
    fontFamily: 'monospace',
    border: '1px solid hsl(var(--border) / 0.5)',
  },
  setupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  setupItem: {
    borderRadius: '12px',
    border: '1px solid',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  setupItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    cursor: 'pointer',
    color: 'hsl(var(--foreground))',
    fontSize: '0.9rem',
  },
  setupItemBody: { padding: '0 1rem 1rem' },
  stepsList: { margin: '0 0 0.75rem', paddingLeft: '1.15rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', lineHeight: 1.5 },
  stepItem: { marginBottom: '0.4rem' },
  setupLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#6C5CE7',
    fontSize: '0.8rem',
    textDecoration: 'none',
    fontWeight: 600,
  },
  costTag: { 
    color: 'hsl(var(--muted-foreground) / 0.8)', 
    fontSize: '0.75rem', 
    margin: 0, 
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '1rem',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid hsl(var(--border))',
    borderTopColor: '#6C5CE7',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', fontWeight: 550 },
};
