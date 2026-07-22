const TrendlineAnalyzer = require('../trendlineAnalyzer');

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

describe('TrendlineAnalyzer Unit Tests', () => {
  let analyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new TrendlineAnalyzer();
  });

  describe('Time Granularity & Grouping (`getTimeKey` & `groupByTime`)', () => {
    test('groups mentions by hour, day, and week granularity accurately', () => {
      const mentions = [
        { timestamp: new Date('2026-07-20T10:15:00Z'), rageIndex: 40 },
        { timestamp: new Date('2026-07-20T10:45:00Z'), rageIndex: 50 },
        { timestamp: new Date('2026-07-20T14:10:00Z'), rageIndex: 60 }
      ];

      const hourGroups = analyzer.groupByTime(mentions, 'hour');
      expect(Object.keys(hourGroups)).toHaveLength(2); // 10:00 and 14:00

      const dayGroups = analyzer.groupByTime(mentions, 'day');
      expect(Object.keys(dayGroups)).toHaveLength(1); // 2026-07-20
    });

    test('getTimeKey handles week boundary properly', () => {
      const d = new Date(2026, 6, 22); // Wednesday July 22, 2026
      const weekKey = analyzer.getTimeKey(d, 'week');
      const parsed = new Date(weekKey);
      expect(parsed.getDay()).toBe(0); // Sunday start of week
    });
  });

  describe('Dual Moving Averages (`calculateMovingAverage`)', () => {
    test('calculates exact 7-period and 30-period rolling averages', () => {
      const timeline = [
        { timestamp: '2026-07-01T00:00:00Z', rageIndex: 20 },
        { timestamp: '2026-07-02T00:00:00Z', rageIndex: 30 },
        { timestamp: '2026-07-03T00:00:00Z', rageIndex: 40 },
        { timestamp: '2026-07-04T00:00:00Z', rageIndex: 50 }
      ];

      const avg7d = analyzer.calculateMovingAverage(timeline, 7);
      expect(avg7d).toHaveLength(4);
      expect(avg7d[0].value).toBe(20);
      expect(avg7d[1].value).toBe(25);
      expect(avg7d[3].value).toBe(35); // (20+30+40+50)/4 = 35

      const avg30d = analyzer.calculateMovingAverage(timeline, 30);
      expect(avg30d[3].value).toBe(35);
    });
  });

  describe('Statistical Spike Detection (`detectSpikes`)', () => {
    test('triggers alert when score exceeds rolling mean plus 2 standard deviations and meets minimum sample thresholds', () => {
      const timeline = [
        { timestamp: '2026-07-01T00:00:00Z', date: new Date('2026-07-01'), rageIndex: 30, mentionCount: 15 },
        { timestamp: '2026-07-02T00:00:00Z', date: new Date('2026-07-02'), rageIndex: 32, mentionCount: 18 },
        { timestamp: '2026-07-03T00:00:00Z', date: new Date('2026-07-03'), rageIndex: 31, mentionCount: 20 },
        { timestamp: '2026-07-04T00:00:00Z', date: new Date('2026-07-04'), rageIndex: 29, mentionCount: 14 },
        { timestamp: '2026-07-05T00:00:00Z', date: new Date('2026-07-05'), rageIndex: 85, mentionCount: 25 } // Huge spike!
      ];

      const spikes = analyzer.detectSpikes(timeline, { minSampleThreshold: 5, minDeviationJump: 10 });
      expect(spikes).toHaveLength(1);
      expect(spikes[0].rageIndex).toBe(85);
      expect(spikes[0].severity).toBe('critical');
    });

    test('ignores high scores when sample size is below minimum threshold (no noisy false positives)', () => {
      const timeline = [
        { timestamp: '2026-07-01T00:00:00Z', date: new Date('2026-07-01'), rageIndex: 30, mentionCount: 15 },
        { timestamp: '2026-07-02T00:00:00Z', date: new Date('2026-07-02'), rageIndex: 32, mentionCount: 18 },
        { timestamp: '2026-07-03T00:00:00Z', date: new Date('2026-07-03'), rageIndex: 31, mentionCount: 20 },
        { timestamp: '2026-07-04T00:00:00Z', date: new Date('2026-07-04'), rageIndex: 88, mentionCount: 2 } // Only 2 mentions!
      ];

      const spikes = analyzer.detectSpikes(timeline, { minSampleThreshold: 5 });
      expect(spikes).toHaveLength(0); // Suppressed due to low sample size
    });

    test('ignores minor fluctuations below minimum deviation jump', () => {
      const timeline = [
        { timestamp: '2026-07-01T00:00:00Z', date: new Date('2026-07-01'), rageIndex: 30, mentionCount: 20 },
        { timestamp: '2026-07-02T00:00:00Z', date: new Date('2026-07-02'), rageIndex: 30, mentionCount: 20 },
        { timestamp: '2026-07-03T00:00:00Z', date: new Date('2026-07-03'), rageIndex: 30, mentionCount: 20 },
        { timestamp: '2026-07-04T00:00:00Z', date: new Date('2026-07-04'), rageIndex: 35, mentionCount: 20 } // 5 point jump
      ];

      const spikes = analyzer.detectSpikes(timeline, { minDeviationJump: 10 });
      expect(spikes).toHaveLength(0); // Suppressed due to small absolute jump
    });
  });

  describe('Empty Trendline & Volatility', () => {
    test('getEmptyTrendline returns structured movingAverages map', () => {
      const empty = analyzer.getEmptyTrendline();
      expect(empty.movingAverages['7d']).toEqual([]);
      expect(empty.movingAverages['30d']).toEqual([]);
    });

    test('calculateVolatility classifies correctly', () => {
      expect(analyzer.calculateVolatility([
        { rageIndex: 20 }, { rageIndex: 45 }, { rageIndex: 20 }
      ])).toBe('very high');

      expect(analyzer.calculateVolatility([
        { rageIndex: 20 }, { rageIndex: 22 }, { rageIndex: 23 }
      ])).toBe('low');
    });
  });
});
