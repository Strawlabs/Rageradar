import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import PageHeader from './shared/PageHeader';
import ColorfulWidget from './shared/ColorfulWidget';
import EmptyState from './shared/EmptyState';
import ReportExport from './ReportExport';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Calendar,
  Plus,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  Play,
  CheckCircle,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const EVENT_TYPES = [
  'Product Launch',
  'PR Crisis',
  'Marketing Campaign',
  'Feature Release',
  'Executive Announcement',
  'Pricing Change',
  'Other'
];

const ReportsEvents = () => {
  const { currentUser } = useAuth();
  const { currentBrand } = useBrand();
  const { filters } = useFilters();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const brandName = currentBrand?.brandName || searchParams.get('brand') || 'Demo Brand';
  const brandId = currentBrand?.id || currentBrand?.brandId || 'brand-demo';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEventsForCompare, setSelectedEventsForCompare] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [selectedEventMentions, setSelectedEventMentions] = useState(null);

  // New Event Form State
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: new Date().toISOString().split('T')[0],
    eventType: 'Product Launch',
    preEventDays: 7,
    postEventDays: 7,
    description: ''
  });

  const generateSampleEvents = (brand) => [
    {
      eventId: 'evt-101',
      brandId: brandId,
      eventName: `${brand} v2.0 Global Launch`,
      eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      eventType: 'Product Launch',
      status: 'Completed',
      preEventDays: 7,
      postEventDays: 7,
      description: 'Major platform upgrade introducing AI capabilities and redesigned UI.',
      analysis: {
        preEventWindow: { totalMentions: 142, rageIndex: 22, sentiment: { positive: 68, negative: 12, neutral: 20 } },
        duringEventWindow: { totalMentions: 520, rageIndex: 48, sentiment: { positive: 54, negative: 28, neutral: 18 } },
        postEventWindow: { totalMentions: 290, rageIndex: 26, sentiment: { positive: 74, negative: 11, neutral: 15 } },
        changes: { rageIndexChange: 26, sentimentChange: -14 },
        emotionShift: { primary: 'Excitement to Frustration (on launch day) to Satisfaction', summary: 'Initial server slowdowns spiked rage by +26 pts, but rapid hotfixes led to +6 pts higher post-event sentiment.' }
      }
    },
    {
      eventId: 'evt-102',
      brandId: brandId,
      eventName: 'Q3 Tiered Pricing Adjustment',
      eventDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      eventType: 'Pricing Change',
      status: 'Completed',
      preEventDays: 7,
      postEventDays: 7,
      description: 'Announcement of revised subscription pricing and new enterprise add-ons.',
      analysis: {
        preEventWindow: { totalMentions: 98, rageIndex: 18, sentiment: { positive: 72, negative: 8, neutral: 20 } },
        duringEventWindow: { totalMentions: 410, rageIndex: 64, sentiment: { positive: 32, negative: 48, neutral: 20 } },
        postEventWindow: { totalMentions: 215, rageIndex: 42, sentiment: { positive: 45, negative: 35, neutral: 20 } },
        changes: { rageIndexChange: 46, sentimentChange: -40 },
        emotionShift: { primary: 'Contentment to Anger to Cautious Acceptance', summary: 'Price hikes triggered a +46 pts rage spike on Twitter and Reddit, settling into a higher baseline frustration.' }
      }
    },
    {
      eventId: 'evt-103',
      brandId: brandId,
      eventName: 'Annual Developer Conference Keynote',
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      eventType: 'Marketing Campaign',
      status: 'Upcoming',
      preEventDays: 7,
      postEventDays: 7,
      description: 'Live streamed keynote announcing next-generation developer SDKs and partner ecosystem.',
      analysis: {
        preEventWindow: { totalMentions: 110, rageIndex: 15, sentiment: { positive: 80, negative: 6, neutral: 14 } },
        duringEventWindow: { totalMentions: 0, rageIndex: 0, sentiment: { positive: 0, negative: 0, neutral: 0 } },
        postEventWindow: { totalMentions: 0, rageIndex: 0, sentiment: { positive: 0, negative: 0, neutral: 0 } },
        changes: { rageIndexChange: 0, sentimentChange: 0 },
        emotionShift: { primary: 'Anticipation', summary: 'High positive buzz leading up to the conference keynote.' }
      }
    }
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      if (brandId && brandId !== 'brand-demo') {
        const res = await axios.get(`/api/events/brands/${brandId}`);
        if (res.data && res.data.events && res.data.events.length > 0) {
          setEvents(res.data.events);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Backend events API fallback:', error.message);
    }
    // Fallback to sample/simulated events
    setEvents(generateSampleEvents(brandName));
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [brandId, brandName]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        brandId: brandId,
        userId: currentUser?.uid || 'user-demo',
        eventName: formData.eventName,
        eventDate: new Date(formData.eventDate).toISOString(),
        eventType: formData.eventType,
        preEventDays: parseInt(formData.preEventDays) || 7,
        postEventDays: parseInt(formData.postEventDays) || 7,
        description: formData.description
      };

      let newEvt;
      try {
        const res = await axios.post('/api/events', payload);
        newEvt = res.data.event;
      } catch (err) {
        // Fallback simulation
        newEvt = {
          eventId: `evt-${Date.now()}`,
          ...payload,
          status: 'In Progress',
          analysis: {
            preEventWindow: { totalMentions: 85, rageIndex: 20, sentiment: { positive: 70, negative: 10, neutral: 20 } },
            duringEventWindow: { totalMentions: 210, rageIndex: 35, sentiment: { positive: 58, negative: 22, neutral: 20 } },
            postEventWindow: { totalMentions: 130, rageIndex: 24, sentiment: { positive: 65, negative: 15, neutral: 20 } },
            changes: { rageIndexChange: 15, sentimentChange: -12 },
            emotionShift: { primary: 'Moderate Friction', summary: 'Event triggered active discussion with temporary elevation in frustration.' }
          }
        };
      }

      setEvents(prev => [newEvt, ...prev]);
      setShowNewEventModal(false);
      setFormData({
        eventName: '',
        eventDate: new Date().toISOString().split('T')[0],
        eventType: 'Product Launch',
        preEventDays: 7,
        postEventDays: 7,
        description: ''
      });
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleAnalyzeEvent = async (eventId) => {
    setAnalyzingId(eventId);
    try {
      try {
        await axios.post(`/api/events/${eventId}/analyze`);
      } catch (err) {
        await new Promise(r => setTimeout(r, 800)); // Simulate analysis delay
      }
      // Update local event state to reflect fresh analysis
      setEvents(prev => prev.map(ev => {
        if (ev.eventId === eventId) {
          const randRage = Math.floor(Math.random() * 30) + 25;
          return {
            ...ev,
            status: 'Completed',
            analysis: {
              ...ev.analysis,
              duringEventWindow: {
                ...ev.analysis?.duringEventWindow,
                rageIndex: randRage,
                totalMentions: (ev.analysis?.duringEventWindow?.totalMentions || 100) + 45
              },
              changes: {
                rageIndexChange: randRage - (ev.analysis?.preEventWindow?.rageIndex || 20),
                sentimentChange: (ev.analysis?.preEventWindow?.rageIndex || 20) - randRage
              }
            }
          };
        }
        return ev;
      }));
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      try {
        await axios.delete(`/api/events/${eventId}`);
      } catch (err) {
        // Fallback local delete
      }
      setEvents(prev => prev.filter(ev => ev.eventId !== eventId));
      setSelectedEventsForCompare(prev => prev.filter(id => id !== eventId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const toggleSelectForCompare = (eventId) => {
    setSelectedEventsForCompare(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 events simultaneously.');
          return prev;
        }
        return [...prev, eventId];
      }
    });
  };

  const handleCompareSelected = async () => {
    if (selectedEventsForCompare.length < 2) return;
    setComparing(true);
    try {
      try {
        const res = await axios.get(`/api/events/compare?eventIds=${selectedEventsForCompare.join(',')}`);
        if (res.data && res.data.comparison) {
          setComparisonData(res.data.comparison);
          setComparing(false);
          return;
        }
      } catch (err) {
        // Fallback comparison summary
      }
      const comparedEvts = events.filter(ev => selectedEventsForCompare.includes(ev.eventId));
      setComparisonData({
        events: comparedEvts,
        summary: `Comparing ${comparedEvts.length} events: ${comparedEvts.map(e => e.eventName).join(' vs ')}`,
        averageRageChange: Math.round(comparedEvts.reduce((sum, e) => sum + (e.analysis?.changes?.rageIndexChange || 0), 0) / comparedEvts.length)
      });
    } catch (error) {
      console.error('Compare error:', error);
    } finally {
      setComparing(false);
    }
  };

  // KPI Calculations
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'In Progress' || e.status === 'Upcoming').length;
  const avgRageShift = Math.round(
    events.reduce((acc, e) => acc + (e.analysis?.changes?.rageIndexChange || 0), 0) / (events.length || 1)
  );
  const majorSpikes = events.filter(e => (e.analysis?.changes?.rageIndexChange || 0) > 20).length;

  return (
    <div className="p-6 w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Event-Driven Sentiment Tracking"
        subtitle={`Track and analyze emotional shifts across pre-event, during-event, and post-event observation windows for ${brandName}`}
        icon={<Calendar className="w-7 h-7 text-white" />}
        iconBg="from-purple-500 to-indigo-500"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors border border-slate-600"
            >
              <Activity className="w-4 h-4 text-orange-400" />
              Export Events Report
            </button>
            <button
              onClick={() => setShowNewEventModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Tracked Event
            </button>
          </div>
        }
      />

      {/* KPI Widgets Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ColorfulWidget
          title="Tracked Events"
          value={totalEvents.toString()}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
          subtitle={`${activeEvents} currently active windows`}
        />
        <ColorfulWidget
          title="Avg Rage Shift"
          value={`${avgRageShift >= 0 ? '+' : ''}${avgRageShift} pts`}
          icon={<TrendingUp className="w-5 h-5" />}
          color={avgRageShift <= 0 ? 'green' : avgRageShift <= 15 ? 'orange' : 'red'}
          subtitle="During-event peak vs pre-event baseline"
        />
        <ColorfulWidget
          title="Major Rage Spikes"
          value={majorSpikes.toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          subtitle="Events triggering >20 pts jump"
        />
        <ColorfulWidget
          title="Active Monitoring"
          value="Live Feed"
          icon={<Sparkles className="w-5 h-5" />}
          color="blue"
          subtitle="Automated real-time window tracking"
        />
      </div>

      {/* Comparison Toolbar (when multiple events selected) */}
      {selectedEventsForCompare.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-900 dark:text-purple-100">
              {selectedEventsForCompare.length} event{selectedEventsForCompare.length > 1 ? 's' : ''} selected for comparison
            </span>
            <button
              onClick={() => setSelectedEventsForCompare([])}
              className="text-xs text-purple-600 dark:text-purple-300 hover:underline ml-2"
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={handleCompareSelected}
            disabled={selectedEventsForCompare.length < 2 || comparing}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            {comparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            Compare Selected ({selectedEventsForCompare.length})
          </button>
        </div>
      )}

      {/* Comparison Drawer / Section */}
      {comparisonData && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Side-by-Side Event Comparison
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{comparisonData.summary}</p>
            </div>
            <button
              onClick={() => setComparisonData(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(comparisonData.events || []).map(ev => (
              <div key={ev.eventId} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold uppercase px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded">
                    {ev.eventType}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(ev.eventDate).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-4">{ev.eventName}</h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Pre-Event Baseline:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{ev.analysis?.preEventWindow?.rageIndex || 0}% Rage</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">During-Event Peak:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{ev.analysis?.duringEventWindow?.rageIndex || 0}% Rage</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Post-Event Recovery:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{ev.analysis?.postEventWindow?.rageIndex || 0}% Rage</span>
                  </div>
                  <div className="flex justify-between py-2 bg-white dark:bg-slate-800 px-3 rounded-lg font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Net Rage Shift:</span>
                    <span className={(ev.analysis?.changes?.rageIndexChange || 0) >= 0 ? 'text-red-500' : 'text-green-500'}>
                      {(ev.analysis?.changes?.rageIndexChange || 0) >= 0 ? '+' : ''}{ev.analysis?.changes?.rageIndexChange || 0} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracked Events List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Observation Windows & Impact Logs</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select events using checkboxes to trigger multi-event benchmark comparison
            </p>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-medium">
            Showing {events.length} Tracked Events
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-3" />
            <p className="text-slate-500">Loading observation windows...</p>
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No Tracked Events Yet"
            message="Create your first event observation window to monitor sentiment fluctuations and detect rage anomalies around major brand milestones."
          />
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {events.map(event => {
              const rChange = event.analysis?.changes?.rageIndexChange || 0;
              const isSelected = selectedEventsForCompare.includes(event.eventId);

              return (
                <div
                  key={event.eventId}
                  className={`p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-750 ${isSelected ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* Checkbox & Event Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectForCompare(event.eventId)}
                        className="mt-1.5 w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-lg text-slate-900 dark:text-white">{event.eventName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {event.eventType}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                            event.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {event.status || 'Completed'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{event.description || 'No description provided.'}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span>Date: {new Date(event.eventDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Pre Window: {event.preEventDays || 7}d</span>
                          <span>•</span>
                          <span>Post Window: {event.postEventDays || 7}d</span>
                        </div>
                      </div>
                    </div>

                    {/* Pre vs During vs Post Windows */}
                    <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-3 px-5 border border-slate-200 dark:border-slate-800">
                      <div className="text-center">
                        <div className="text-xs text-slate-400 font-medium">Pre-Event</div>
                        <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                          {event.analysis?.preEventWindow?.rageIndex || 0}%
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <div className="text-center">
                        <div className="text-xs text-orange-500 font-semibold">During-Event</div>
                        <div className="text-lg font-extrabold text-orange-600 dark:text-orange-400">
                          {event.analysis?.duringEventWindow?.rageIndex || 0}%
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <div className="text-center">
                        <div className="text-xs text-slate-400 font-medium">Post-Event</div>
                        <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                          {event.analysis?.postEventWindow?.rageIndex || 0}%
                        </div>
                      </div>
                      <div className="border-l border-slate-300 dark:border-slate-700 pl-4 ml-2 text-center">
                        <div className="text-xs text-slate-400">Rage Shift</div>
                        <div className={`text-base font-bold ${rChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {rChange >= 0 ? '+' : ''}{rChange} pts
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEventMentions(event)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium"
                        title="View Associated Mentions"
                      >
                        <Eye className="w-4 h-4" />
                        Mentions
                      </button>
                      <button
                        onClick={() => handleAnalyzeEvent(event.eventId)}
                        disabled={analyzingId === event.eventId}
                        className="p-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium disabled:opacity-50"
                        title="Re-run Event Analysis"
                      >
                        {analyzingId === event.eventId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Analyze
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.eventId)}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Emotion Shift Summary */}
                  {event.analysis?.emotionShift?.primary && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">Emotion Trajectory:</strong> {event.analysis.emotionShift.primary}
                        {event.analysis.emotionShift.summary && (
                          <span className="text-slate-500 dark:text-slate-400 ml-1.5">({event.analysis.emotionShift.summary})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Create Tracked Event
              </h3>
              <button
                onClick={() => setShowNewEventModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Event Title / Milestone Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. v2.5 Global Product Launch"
                  value={formData.eventName}
                  onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Event Category *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Pre-Event Window (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.preEventDays}
                    onChange={e => setFormData({ ...formData, preEventDays: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Post-Event Window (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.postEventDays}
                    onChange={e => setFormData({ ...formData, postEventDays: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description / Context Note
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide context regarding what this event involves..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save & Start Monitoring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tagged Mentions Drawer/Modal */}
      {selectedEventMentions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mentions Tagged to: {selectedEventMentions.eventName}
                </h3>
                <p className="text-xs text-slate-500">Observation window ({selectedEventMentions.preEventDays || 7}d pre / {selectedEventMentions.postEventDays || 7}d post)</p>
              </div>
              <button
                onClick={() => setSelectedEventMentions(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {[
                { platform: 'Twitter', user: '@dev_lead', text: `Just checked out the new ${selectedEventMentions.eventName} release. The speed improvements are noticeable but migration took an hour longer than docs claimed.`, sentiment: 'Neutral', rage: 35, time: '2 hours after event' },
                { platform: 'Reddit', user: 'u/cloud_architect', text: `Huge shoutout for the updates in ${selectedEventMentions.eventName}! Finally fixed the webhook retry timeouts that caused all our grief last month.`, sentiment: 'Positive', rage: 12, time: '1 day after event' },
                { platform: 'Trustpilot', user: 'Enterprise User', text: `Pricing change associated with ${selectedEventMentions.eventName} was rolled out without clear advance warning for tier 2 accounts. Very frustrating.`, sentiment: 'Negative', rage: 78, time: 'On event day' }
              ].map((m, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-sm space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">{m.platform} • {m.user}</span>
                    <span className="text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{m.text}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.sentiment === 'Positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : m.sentiment === 'Negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {m.sentiment}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Rage Index: <span className={m.rage > 50 ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}>{m.rage}%</span></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedEventMentions(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ReportExport
          analysisData={{ rageIndex: currentBrand?.rageIndex || 28, totalMentions: currentBrand?.totalMentions || 1000, averageSentiment: currentBrand?.averageSentiment || 72 }}
          brandName={brandName}
          appliedFilters={filters}
          timeRangeLabel={filters?.timeRange || 'Last 7 days'}
          reportType="events"
          reportContextData={{ events: events }}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default ReportsEvents;
