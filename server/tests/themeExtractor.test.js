/**
 * ThemeExtractor v2 — Unit Tests
 * Tests: synonym clustering, rage-weighted ranking, high-intensity filtering,
 *        noise removal, and tagMentionsWithThemes back-propagation.
 */

const ThemeExtractor = require('../utils/themeExtractor');

// Helper to build mock mentions
const makeMention = (text, rageIndex = 70, platform = 'reddit') => ({
    text,
    rageIndex,
    platform,
    timestamp: new Date().toISOString(),
    emotions: rageIndex >= 60
        ? [{ label: 'anger', score: 0.8 }]
        : [{ label: 'joy',   score: 0.8 }]
});

describe('ThemeExtractor v2', () => {
    let extractor;

    beforeEach(() => {
        extractor = new ThemeExtractor();
    });

    // -----------------------------------------------------------------------
    // 1. Synonym clustering
    // -----------------------------------------------------------------------
    describe('Synonym clustering', () => {
        it('should collapse "lag", "latency", and "slow" into the same "slow performance" cluster', async () => {
            const mentions = [
                makeMention('The app has terrible lag when loading pages'),
                makeMention('Latency is awful, everything takes forever'),
                makeMention('So slow today, completely unusable'),
                makeMention('Constant lag ruined my session again'),
                makeMention('Horrible latency on mobile network'),
            ];

            const themes = await extractor.extractThemes(mentions, { minRageIndex: 60, topN: 5, minFrequency: 2 });

            const performanceTheme = themes.find(t =>
                t.theme === 'slow performance' || t.keywords.includes('slow performance')
            );
            expect(performanceTheme).toBeDefined();
        });

        it('should collapse "crash", "bug", and "error" into the "crash / error" cluster', async () => {
            const mentions = [
                makeMention('The app keeps crashing every time I open it'),
                makeMention('Got an error on checkout, lost my cart'),
                makeMention('Constant bugs in the new update'),
                makeMention('App crashed twice during payment'),
                makeMention('Critical error when uploading files'),
            ];

            const themes = await extractor.extractThemes(mentions, { minRageIndex: 60, topN: 5, minFrequency: 2 });

            const crashTheme = themes.find(t =>
                t.theme === 'crash / error' || t.keywords.some(k => k === 'crash / error')
            );
            expect(crashTheme).toBeDefined();
        });
    });

    // -----------------------------------------------------------------------
    // 2. Ranking by frequency × avgRageIndex
    // -----------------------------------------------------------------------
    describe('Ranking by intensityScore (frequency x avgRageIndex)', () => {
        it('should rank higher-rage themes above lower-rage themes of the same frequency', async () => {
            const mentions = [
                // High rage + pricing topic (3 mentions, rageIndex ~85)
                makeMention('Absolutely ridiculous fees, highway robbery', 85),
                makeMention('They charged me without consent, fees are insane', 85),
                makeMention('Billing error and extra charges applied to account', 85),
                // Lower rage + slow topic (3 mentions, rageIndex ~45)
                makeMention('App is a bit slow sometimes', 45),
                makeMention('Loading is slow on older devices', 45),
                makeMention('Slightly slow performance compared to competitors', 45),
            ];

            const themes = await extractor.extractThemes(mentions, { minRageIndex: 60, topN: 10, minFrequency: 1 });

            // Pricing (high rage) should outrank slow (low rage)
            if (themes.length >= 2) {
                const pricingIdx = themes.findIndex(t => t.theme === 'pricing');
                const slowIdx    = themes.findIndex(t => t.theme === 'slow performance');
                if (pricingIdx !== -1 && slowIdx !== -1) {
                    expect(pricingIdx).toBeLessThan(slowIdx);
                }
            }
            // intensityScore should be sorted descending
            for (let i = 0; i < themes.length - 1; i++) {
                expect(themes[i].intensityScore).toBeGreaterThanOrEqual(themes[i + 1].intensityScore);
            }
        });
    });

    // -----------------------------------------------------------------------
    // 3. High-intensity filtering (only Rage >= 60 for primary clusters)
    // -----------------------------------------------------------------------
    describe('High-intensity filtering', () => {
        it('should mark themes extracted from high-rage mentions as isPrimaryCluster=true', async () => {
            const mentions = [
                makeMention('Terrible crash every single day', 80),
                makeMention('App error lost all my data', 75),
                makeMention('Bugs ruined the experience completely', 70),
                makeMention('Crash during payment — very angry', 85),
                makeMention('Constant errors with no fix', 72),
            ];

            const themes = await extractor.extractThemes(mentions, { minRageIndex: 60, topN: 5 });

            themes.forEach(t => {
                expect(t.isPrimaryCluster).toBe(true);
            });
        });

        it('should fall back to all mentions and isPrimaryCluster=false when none reach the threshold', async () => {
            const mentions = [
                makeMention('App is okay but a bit slow', 30),
                makeMention('Slow loading on poor wifi', 25),
                makeMention('Sometimes slow but nothing major', 20),
                makeMention('Lag happens occasionally', 28),
                makeMention('Performance could be better', 35),
            ];

            const themes = await extractor.extractThemes(mentions, { minRageIndex: 60, topN: 5, minFrequency: 2 });

            themes.forEach(t => {
                expect(t.isPrimaryCluster).toBe(false);
            });
        });
    });

    // -----------------------------------------------------------------------
    // 4. Noise removal (low-frequency themes dropped)
    // -----------------------------------------------------------------------
    describe('Noise removal', () => {
        it('should exclude themes that appear fewer than minFrequency times', async () => {
            const mentions = [
                // "crash / error" appears 4 times (above threshold)
                makeMention('App crashes on startup', 75),
                makeMention('Crash during checkout process', 80),
                makeMention('Got a fatal error when logging in', 70),
                makeMention('Another crash, losing patience', 75),
                // "purple unicorn" appears only once (should be filtered)
                makeMention('Purple unicorn problem appeared once', 70),
            ];

            const themes = await extractor.extractThemes(mentions, { minRageIndex: 60, topN: 10, minFrequency: 2 });

            const unicornTheme = themes.find(t => t.theme.includes('unicorn'));
            expect(unicornTheme).toBeUndefined();
        });
    });

    // -----------------------------------------------------------------------
    // 5. intensityBand label
    // -----------------------------------------------------------------------
    describe('intensityBand labelling', () => {
        it('should attach the correct severity band to each theme', async () => {
            const mentions = [
                makeMention('Critical crash lost everything', 90),
                makeMention('Crash corrupted my data completely', 88),
                makeMention('App error during payment crash', 85),
                makeMention('Crashes daily without warning', 82),
                makeMention('Horrible crash ruined workflow', 91),
            ];

            const themes = await extractor.extractThemes(mentions, { minRageIndex: 60, topN: 5, minFrequency: 2 });

            themes.forEach(t => {
                expect(['Critical', 'High', 'Moderate', 'Low', 'Minimal']).toContain(t.intensityBand);
                // Themes from very high-rage mentions should be Critical or High
                if (t.avgRageIndex >= 80) expect(t.intensityBand).toBe('Critical');
                if (t.avgRageIndex >= 60 && t.avgRageIndex < 80) expect(t.intensityBand).toBe('High');
            });
        });
    });

    // -----------------------------------------------------------------------
    // 6. tagMentionsWithThemes back-propagation
    // -----------------------------------------------------------------------
    describe('tagMentionsWithThemes', () => {
        it('should stamp matching theme names onto each mention', () => {
            const themes = [
                { theme: 'crash / error', keywords: ['crash / error', 'crash', 'error'] },
                { theme: 'pricing',       keywords: ['pricing', 'fees', 'expensive']    },
            ];

            const mentions = [
                { content: 'App crash lost all my data and files', themes: [] },
                { content: 'Way too expensive, fees are outrageous', themes: [] },
                { content: 'Totally unrelated comment about weather', themes: [] },
                { content: 'Crash and expensive fees ruined it', themes: [] },
            ];

            extractor.tagMentionsWithThemes(mentions, themes);

            expect(mentions[0].themes).toContain('crash / error');
            expect(mentions[0].themes).not.toContain('pricing');

            expect(mentions[1].themes).toContain('pricing');
            expect(mentions[1].themes).not.toContain('crash / error');

            expect(mentions[2].themes).toHaveLength(0);

            // mention 3 has both
            expect(mentions[3].themes).toContain('crash / error');
            expect(mentions[3].themes).toContain('pricing');
        });

        it('should return the same array (mutates in place)', () => {
            const themes = [{ theme: 'pricing', keywords: ['pricing'] }];
            const mentions = [{ content: 'pricing issue', themes: [] }];
            const result = extractor.tagMentionsWithThemes(mentions, themes);
            expect(result).toBe(mentions);
        });

        it('should handle empty themes gracefully', () => {
            const mentions = [{ content: 'some text', themes: [] }];
            const result = extractor.tagMentionsWithThemes(mentions, []);
            expect(result[0].themes).toHaveLength(0);
        });
    });
});
