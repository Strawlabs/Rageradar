/**
 * Autonomous Analyst & Alerts System Unit Tests
 * Tests deduplication, multi-channel dispatch, Ask RageRadar evidence, and Autonomous Analyst briefing generation.
 */

// Mock dependencies
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'user_1', email: 'test@example.com', notifications: {} }, error: null }),
      range: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user_1' } }, error: null }) }
  }
}));

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: {} })
}));

jest.mock('../services/emailService', () => {
  return jest.fn().mockImplementation(() => ({
    sendBrandAlertEmail: jest.fn().mockResolvedValue({ success: true, data: { id: 'email_123' } }),
    sendEmail: jest.fn().mockResolvedValue({ success: true, data: { id: 'email_123' } }),
    sendSystemNotification: jest.fn().mockResolvedValue({ success: true }),
    sendWeeklyReport: jest.fn().mockResolvedValue({ success: true })
  }));
});

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

const NotificationManager = require('../services/notificationManager');
const AutonomousAnalyst = require('../ai/autonomousAnalyst/autonomousAnalyst');
const ChatEngine = require('../ai/askRageRadar/chatEngine');

describe('NotificationManager - Deduplication Engine', () => {
  let manager;

  beforeEach(() => {
    manager = new NotificationManager();
    manager.recentAlertsCache.clear();
  });

  test('isDuplicateAlert returns false for first alert', async () => {
    const result = await manager.isDuplicateAlert('user_1', 'brand_abc', 'rage_spike', 60);
    expect(result).toBe(false);
  });

  test('isDuplicateAlert returns true for duplicate within cooldown', async () => {
    await manager.isDuplicateAlert('user_1', 'brand_abc', 'rage_spike', 60);
    const result = await manager.isDuplicateAlert('user_1', 'brand_abc', 'rage_spike', 60);
    expect(result).toBe(true);
  });

  test('isDuplicateAlert returns false for different alert types', async () => {
    await manager.isDuplicateAlert('user_1', 'brand_abc', 'rage_spike', 60);
    const result = await manager.isDuplicateAlert('user_1', 'brand_abc', 'volume_spike', 60);
    expect(result).toBe(false);
  });

  test('isDuplicateAlert returns false for different brands', async () => {
    await manager.isDuplicateAlert('user_1', 'brand_abc', 'rage_spike', 60);
    const result = await manager.isDuplicateAlert('user_1', 'brand_xyz', 'rage_spike', 60);
    expect(result).toBe(false);
  });
});

describe('NotificationManager - dispatchAlert', () => {
  let manager;

  beforeEach(() => {
    manager = new NotificationManager();
    manager.recentAlertsCache.clear();
    // Mock logNotification to prevent supabase calls
    manager.logNotification = jest.fn().mockResolvedValue(undefined);
  });

  test('dispatchAlert returns success with evidenceUrl', async () => {
    const brandData = { id: 'brand_1', name: 'TestBrand' };
    const alertPayload = {
      type: 'rage_spike',
      title: 'Critical Alert',
      description: 'Test description',
      severity: 'critical',
      currentValue: '85%'
    };

    const result = await manager.dispatchAlert('user_1', brandData, alertPayload, ['web_dashboard']);

    expect(result.success).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(result.evidenceUrl).toContain('/dashboard/mentions');
    expect(result.evidenceUrl).toContain('TestBrand');
    expect(result.results.web_dashboard.success).toBe(true);
    expect(manager.logNotification).toHaveBeenCalled();
  });

  test('dispatchAlert suppresses duplicate alerts', async () => {
    const brandData = { id: 'brand_1', name: 'TestBrand' };
    const alertPayload = { type: 'rage_spike', title: 'Test', description: 'Test', severity: 'high' };

    const first = await manager.dispatchAlert('user_1', brandData, alertPayload, ['web_dashboard']);
    expect(first.success).toBe(true);
    expect(first.duplicate).toBe(false);

    const second = await manager.dispatchAlert('user_1', brandData, alertPayload, ['web_dashboard']);
    expect(second.duplicate).toBe(true);
  });

  test('sendSlackNotification returns error if no webhook URL', async () => {
    const result = await manager.sendSlackNotification(null, { name: 'Test' }, { title: 'Alert' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('No Slack webhook');
  });

  test('sendWebhookNotification returns error if no webhook URL', async () => {
    const result = await manager.sendWebhookNotification(null, { name: 'Test' }, { title: 'Alert' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('No custom webhook');
  });
});

describe('NotificationManager - checkAndTriggerScanAlerts', () => {
  let manager;

  beforeEach(() => {
    manager = new NotificationManager();
    manager.recentAlertsCache.clear();
    manager.dispatchAlert = jest.fn().mockResolvedValue({ success: true, duplicate: false });
  });

  test('triggers critical alert when rageIndex >= 70', async () => {
    const analysis = {
      brandName: 'TestBrand',
      rageIndex: 78,
      rageAlert: true,
      totalMentions: 50,
      searchResults: [{ text: 'Negative', sentiment: 'negative', rageIndex: 75 }]
    };

    await manager.checkAndTriggerScanAlerts('user_1', 'brand_1', analysis);
    expect(manager.dispatchAlert).toHaveBeenCalled();
    const payload = manager.dispatchAlert.mock.calls[0][2];
    expect(payload.type).toBe('rage_spike');
    expect(payload.severity).toBe('critical');
  });

  test('does not trigger when rageIndex is low and mentions are low', async () => {
    const analysis = {
      brandName: 'TestBrand',
      rageIndex: 30,
      totalMentions: 50,
      searchResults: []
    };

    const result = await manager.checkAndTriggerScanAlerts('user_1', 'brand_1', analysis);
    expect(result).toBeNull();
    expect(manager.dispatchAlert).not.toHaveBeenCalled();
  });
});

describe('AutonomousAnalyst - runAutonomousBriefing', () => {
  let analyst;

  beforeEach(() => {
    analyst = new AutonomousAnalyst();
  });

  test('correlateMultiPlatformEvidence returns correlations', () => {
    const mentions = [
      { content: 'Bad service', platform: 'reddit', sentiment: 'negative', rageIndex: 72 },
      { content: 'Great product', platform: 'twitter', sentiment: 'positive', rageIndex: 20 }
    ];
    const platformBreakdown = {
      reddit: { rageIndex: 80, mentionCount: 10 },
      twitter: { rageIndex: 30, mentionCount: 5 }
    };
    const themes = [{ theme: 'Bad service', percentage: 40 }];

    const correlations = analyst.correlateMultiPlatformEvidence('TestBrand', mentions, platformBreakdown, themes);
    expect(Array.isArray(correlations)).toBe(true);
    expect(correlations.length).toBeGreaterThan(0);
    expect(correlations[0]).toHaveProperty('correlationType');
    expect(correlations[0]).toHaveProperty('summary');
    expect(correlations[0]).toHaveProperty('platformsInvolved');
  });

  test('calculateRiskAssessments returns 3 risk axes', () => {
    const risks = analyst.calculateRiskAssessments(75, 500, [{ theme: 'slow' }], []);
    expect(risks).toHaveLength(3);
    expect(risks[0].riskArea).toContain('Reputation');
    expect(risks[1].riskArea).toContain('Retention');
    expect(risks[2].riskArea).toContain('Viral');
    expect(risks[0].score).toBeGreaterThanOrEqual(70);
  });

  test('synthesizeBriefingWithLLM returns structured fallback briefing', async () => {
    const result = await analyst.synthesizeBriefingWithLLM({
      brandName: 'TestBrand',
      rageIndex: 65,
      totalMentions: 100,
      platformBreakdown: {},
      themes: [{ theme: 'reliability', percentage: 40 }],
      evidenceCorrelations: [],
      riskAssessments: [],
      focusArea: null
    });

    expect(result).toHaveProperty('executiveSummary');
    expect(result).toHaveProperty('keyFindings');
    expect(result).toHaveProperty('strategicActions');
    expect(result.executiveSummary).toContain('TestBrand');
    expect(result.keyFindings.length).toBeGreaterThanOrEqual(2);
    expect(result.strategicActions.length).toBeGreaterThanOrEqual(2);
  });
});

describe('ChatEngine - answerQuestion with evidence', () => {
  let chatEngine;

  beforeEach(() => {
    chatEngine = new ChatEngine();
    // Mock supabase call inside answerQuestion
    const { supabase } = require('../supabase');
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [{
          brand_name: 'TestBrand',
          rage_index: 72,
          search_results: [
            { content: 'Service is terrible', platform: 'reddit', url: 'https://reddit.com/r/test', sentiment: 'negative', rageIndex: 80 },
            { content: 'Love this product', platform: 'twitter', url: 'https://twitter.com/test', sentiment: 'positive', rageIndex: 15 }
          ],
          platform_breakdown: { reddit: { rageIndex: 80, mentionCount: 5 } },
          themes: [{ theme: 'service quality', percentage: 50 }],
          insights: { recommendations: [] },
          trendline_summary: null
        }],
        error: null
      })
    });
  });

  test('answerQuestion returns object with answer, evidence, and suggestedQuestions', async () => {
    const result = await chatEngine.answerQuestion('brand_1', 'Why is Rage Index high?', []);

    expect(result).toHaveProperty('answer');
    expect(result).toHaveProperty('evidence');
    expect(result).toHaveProperty('suggestedQuestions');
    expect(typeof result.answer).toBe('string');
    expect(result.answer.length).toBeGreaterThan(0);
    expect(Array.isArray(result.evidence)).toBe(true);
    expect(Array.isArray(result.suggestedQuestions)).toBe(true);
  });
});
