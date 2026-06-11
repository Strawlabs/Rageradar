# RageRadar Testing Plan

## Overview

Comprehensive testing strategy for all new features before launch.

---

## 1. Unit Tests

### Backend Tests

**Emotion Analyzer**
```javascript
// server/tests/emotionAnalyzer.test.js
describe('EmotionAnalyzer', () => {
  test('detects multiple emotions', async () => {
    const analyzer = new EmotionAnalyzer();
    const result = await analyzer.analyzeEmotions('I am frustrated and angry');
    
    expect(result.emotions).toHaveLength(2);
    expect(result.primaryEmotion).toBe('anger');
  });

  test('provides confidence scores', async () => {
    const analyzer = new EmotionAnalyzer();
    const result = await analyzer.analyzeEmotions('This is terrible');
    
    expect(result.emotions[0]).toHaveProperty('confidence');
    expect(['high', 'medium', 'low']).toContain(result.emotions[0].confidence);
  });
});
```

**Rage Index Calculator**
```javascript
// server/tests/rageIndexCalculator.test.js
describe('RageIndexCalculator', () => {
  test('calculates rage index correctly', () => {
    const calculator = new RageIndexCalculator();
    const emotions = [
      { label: 'anger', score: 0.9, weight: 1.0 }
    ];
    
    const result = calculator.calculateForMention(emotions);
    expect(result.rageIndex).toBeGreaterThan(80);
    expect(result.severity).toBe('critical');
  });

  test('handles positive emotions', () => {
    const calculator = new RageIndexCalculator();
    const emotions = [
      { label: 'joy', score: 0.9, weight: -0.5 }
    ];
    
    const result = calculator.calculateForMention(emotions);
    expect(result.rageIndex).toBeLessThan(30);
  });
});
```

**Theme Extractor**
```javascript
// server/tests/themeExtractor.test.js
describe('ThemeExtractor', () => {
  test('extracts themes from mentions', async () => {
    const extractor = new ThemeExtractor();
    const mentions = [
      { text: 'battery life is terrible', rageIndex: 80 },
      { text: 'battery drains too fast', rageIndex: 75 }
    ];
    
    const themes = await extractor.extractThemes(mentions);
    expect(themes).toContainEqual(
      expect.objectContaining({ theme: expect.stringContaining('battery') })
    );
  });
});
```

---

### Frontend Tests

**EmotionDisplay Component**
```javascript
// client/src/components/EmotionDisplay.test.jsx
import { render, screen } from '@testing-library/react';
import EmotionDisplay from './EmotionDisplay';

describe('EmotionDisplay', () => {
  test('renders emotions correctly', () => {
    const emotions = [
      { label: 'anger', score: 0.85, confidence: 'high' },
      { label: 'frustration', score: 0.72, confidence: 'high' }
    ];
    
    render(<EmotionDisplay emotions={emotions} primaryEmotion="anger" />);
    
    expect(screen.getByText('anger')).toBeInTheDocument();
    expect(screen.getByText('frustration')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });
});
```

**RageIndexGauge Component**
```javascript
// client/src/components/RageIndexGauge.test.jsx
describe('RageIndexGauge', () => {
  test('displays correct severity color', () => {
    const { container } = render(
      <RageIndexGauge rageIndex={85} severity="critical" />
    );
    
    const gauge = container.querySelector('.rage-index-gauge');
    expect(gauge).toBeInTheDocument();
  });
});
```

---

## 2. Integration Tests

### API Integration Tests

```javascript
// server/tests/integration/api.test.js
describe('Analysis API', () => {
  test('POST /api/analyze with multi-emotion', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        brandName: 'TestBrand',
        options: { multiEmotion: true }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.analysis).toHaveProperty('emotions');
    expect(response.body.analysis).toHaveProperty('rageIndex');
  });

  test('enforces plan limits', async () => {
    // Use free tier token
    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', `Bearer ${freeTierToken}`)
      .send({ brandName: 'TestBrand' });
    
    // After 5 analyses, should get 403
    expect(response.status).toBe(403);
    expect(response.body.upgrade).toBe(true);
  });
});

describe('Events API', () => {
  test('creates event successfully', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        brandId: 'brand_123',
        eventName: 'Test Launch',
        eventDate: '2025-12-15',
        eventType: 'launch'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.event).toHaveProperty('eventId');
  });

  test('requires Pro plan', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${starterToken}`)
      .send({
        brandId: 'brand_123',
        eventName: 'Test Launch',
        eventDate: '2025-12-15'
      });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toContain('not available');
  });
});
```

---

## 3. End-to-End Tests

### User Flows

**Flow 1: New Analysis with Emotions**
```javascript
// e2e/analysis.spec.js
describe('Brand Analysis Flow', () => {
  test('complete analysis with emotions', async () => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. Navigate to dashboard
    await page.waitForSelector('.dashboard');
    
    // 3. Start new analysis
    await page.click('button:has-text("New Analysis")');
    await page.fill('[name="brandName"]', 'Apple');
    await page.click('button:has-text("Analyze")');
    
    // 4. Wait for results
    await page.waitForSelector('.emotion-display', { timeout: 60000 });
    
    // 5. Verify emotions displayed
    const emotions = await page.$$('.emotion-item');
    expect(emotions.length).toBeGreaterThan(0);
    
    // 6. Verify rage index
    const rageIndex = await page.textContent('.rage-index-gauge text');
    expect(parseInt(rageIndex)).toBeGreaterThanOrEqual(0);
    expect(parseInt(rageIndex)).toBeLessThanOrEqual(100);
  });
});
```

**Flow 2: Event Tracking**
```javascript
describe('Event Tracking Flow', () => {
  test('create and analyze event', async () => {
    // Login as Pro user
    await loginAsProUser();
    
    // Create event
    await page.click('a:has-text("Events")');
    await page.click('button:has-text("Create Event")');
    
    await page.fill('[name="eventName"]', 'Product Launch');
    await page.fill('[name="eventDate"]', '2025-12-15');
    await page.selectOption('[name="eventType"]', 'launch');
    await page.click('button:has-text("Create")');
    
    // Wait for analysis
    await page.waitForSelector('.event-analysis', { timeout: 90000 });
    
    // Verify pre/during/post data
    expect(await page.textContent('.pre-event-rage')).toBeTruthy();
    expect(await page.textContent('.during-event-rage')).toBeTruthy();
    expect(await page.textContent('.post-event-rage')).toBeTruthy();
  });
});
```

---

## 4. Performance Tests

### Load Testing

```javascript
// tests/performance/load.test.js
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  const response = http.post(
    'http://localhost:5001/api/analyze',
    JSON.stringify({
      brandName: 'TestBrand',
      options: { multiEmotion: true }
    }),
    {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
}
```

---

## 5. Security Tests

### Authentication Tests

```javascript
describe('Security', () => {
  test('requires authentication', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ brandName: 'TestBrand' });
    
    expect(response.status).toBe(401);
  });

  test('validates JWT token', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer invalid_token')
      .send({ brandName: 'TestBrand' });
    
    expect(response.status).toBe(401);
  });

  test('prevents SQL injection', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ brandName: "'; DROP TABLE users; --" });
    
    expect(response.status).not.toBe(500);
  });
});
```

---

## 6. Accessibility Tests

```javascript
// e2e/accessibility.spec.js
import { injectAxe, checkA11y } from 'axe-playwright';

describe('Accessibility', () => {
  test('dashboard is accessible', async () => {
    await page.goto('http://localhost:3000/dashboard');
    await injectAxe(page);
    await checkA11y(page);
  });

  test('emotion display is accessible', async () => {
    await page.goto('http://localhost:3000/analysis/123');
    await injectAxe(page);
    await checkA11y(page, '.emotion-display');
  });
});
```

---

## 7. Browser Compatibility

**Test Matrix:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## 8. Test Execution Plan

### Phase 1: Unit Tests (Week 1)
- [ ] Backend unit tests (2 days)
- [ ] Frontend unit tests (2 days)
- [ ] Fix failing tests (1 day)

### Phase 2: Integration Tests (Week 2)
- [ ] API integration tests (2 days)
- [ ] Database integration tests (1 day)
- [ ] Fix integration issues (2 days)

### Phase 3: E2E Tests (Week 3)
- [ ] User flow tests (2 days)
- [ ] Cross-browser testing (2 days)
- [ ] Mobile testing (1 day)

### Phase 4: Performance & Security (Week 4)
- [ ] Load testing (1 day)
- [ ] Security audit (2 days)
- [ ] Accessibility testing (1 day)
- [ ] Fix critical issues (1 day)

---

## 9. Test Coverage Goals

**Minimum Coverage:**
- Backend: 80%
- Frontend: 70%
- Integration: 60%

**Critical Paths (100% coverage):**
- Authentication
- Payment processing
- Plan enforcement
- Emotion detection
- Rage index calculation

---

## 10. Bug Tracking

**Priority Levels:**
- P0 (Critical): Blocks launch
- P1 (High): Major feature broken
- P2 (Medium): Minor feature issue
- P3 (Low): Nice to have

**Bug Report Template:**
```markdown
**Title:** Brief description

**Priority:** P0/P1/P2/P3

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** What should happen

**Actual:** What actually happens

**Environment:** Browser, OS, Plan tier

**Screenshots:** Attach if applicable
```

---

## Test Execution Commands

```bash
# Backend tests
cd server
npm test                    # All tests
npm test -- --coverage      # With coverage
npm test emotionAnalyzer    # Specific test

# Frontend tests
cd client
npm test                    # All tests
npm test -- --coverage      # With coverage
npm test EmotionDisplay     # Specific component

# E2E tests
npm run test:e2e            # All E2E tests
npm run test:e2e:headed     # With browser visible

# Performance tests
k6 run tests/performance/load.test.js
```

---

**Status:** Ready for testing phase 🧪
