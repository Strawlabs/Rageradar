/**
 * Query Planner Unit Tests
 */

const QueryPlanner = require('../ai/queryPlanner');

describe('QueryPlanner', () => {
    let planner;

    beforeEach(() => {
        planner = new QueryPlanner();
    });

    test('should generate platform-specific query categories', () => {
        const params = {
            brandName: 'Stripe',
            website: 'stripe.com',
            competitors: ['Square', 'PayPal']
        };

        const plan = planner.planQueries(params);

        expect(plan).toHaveProperty('web');
        expect(plan).toHaveProperty('reddit');
        expect(plan).toHaveProperty('youtube');
        expect(plan).toHaveProperty('appstore');

        expect(plan.web.length).toBeGreaterThan(3);
        expect(plan.reddit.length).toBeGreaterThan(2);
        expect(plan.youtube.length).toBeGreaterThan(1);
        expect(plan.appstore.length).toBeGreaterThan(0);
    });

    test('should include negative intent keywords in web queries', () => {
        const plan = planner.planQueries({ brandName: 'Stripe' });
        
        const hasNegativeQuery = plan.web.some(q => 
            q.includes('complaints') || q.includes('problems') || q.includes('broken')
        );
        expect(hasNegativeQuery).toBe(true);
    });

    test('should include competitor comparison queries', () => {
        const plan = planner.planQueries({
            brandName: 'Stripe',
            competitors: ['Square']
        });

        const hasComparison = plan.web.some(q => q.includes('Stripe') && q.includes('Square') && q.includes('vs'));
        expect(hasComparison).toBe(true);
    });

    test('should gracefully handle missing optional arguments', () => {
        const plan = planner.planQueries({ brandName: 'Stripe' });
        expect(plan.web.length).toBeGreaterThan(2);
        expect(plan.web[0]).toBe('Stripe');
    });

    test('should gracefully handle empty or undefined brand name', () => {
        const plan = planner.planQueries({ brandName: '' });
        expect(plan.web.length).toBe(0);
        expect(plan.reddit.length).toBe(0);
    });
});
