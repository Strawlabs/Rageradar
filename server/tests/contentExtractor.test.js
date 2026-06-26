/**
 * Content Extractor Unit Tests
 */

const ContentExtractor = require('../ai/contentExtractor');
const axios = require('axios');

jest.mock('axios');

describe('ContentExtractor', () => {
    let extractor;

    beforeEach(() => {
        extractor = new ContentExtractor({ timeout: 100, maxRetries: 1 });
        jest.clearAllMocks();
    });

    test('should extract readable text and strip tags, scripts, and navigation', () => {
        const mockHtml = `
            <html>
                <head><title>Mock Page</title></head>
                <body>
                    <header><h1>Header Menu</h1></header>
                    <nav><a href="/home">Home</a></nav>
                    <main>
                        <article>
                            <p>Stripe has been having checkout failures since morning.</p>
                            <style>.alert { color: red; }</style>
                            <script>console.log('test');</script>
                            <p>Customers are complaining about API errors.</p>
                        </article>
                    </main>
                    <aside>Related links</aside>
                    <footer>Copyright 2026</footer>
                </body>
            </html>
        `;

        const cleaned = extractor.extractText(mockHtml);

        expect(cleaned).toContain('Stripe has been having checkout failures since morning.');
        expect(cleaned).toContain('Customers are complaining about API errors.');
        expect(cleaned).not.toContain('Header Menu');
        expect(cleaned).not.toContain('Home');
        expect(cleaned).not.toContain('Related links');
        expect(cleaned).not.toContain('Copyright 2026');
        expect(cleaned).not.toContain('console.log');
    });

    test('should fetch and extract content successfully', async () => {
        const mockHtml = '<html><body><main><p>Valid content of sufficient length for test quality checks.</p></main></body></html>';
        axios.get.mockResolvedValueOnce({ data: mockHtml });

        const result = await extractor.extract('https://example.com/test');

        expect(result.success).toBe(true);
        expect(result.content).toBe('Valid content of sufficient length for test quality checks.');
        expect(result.isQuality).toBe(false); // Since content is < 100 characters, it is low quality
    });

    test('should identify high quality content (>100 characters)', async () => {
        const longContent = 'This is a long piece of content that exceeds the default minimum characters threshold of one hundred characters to ensure it is marked as a high quality article by the ContentExtractor parser.';
        const mockHtml = `<html><body><p>${longContent}</p></body></html>`;
        axios.get.mockResolvedValueOnce({ data: mockHtml });

        const result = await extractor.extract('https://example.com/test');

        expect(result.success).toBe(true);
        expect(result.isQuality).toBe(true);
        expect(result.content).toBe(longContent);
    });

    test('should handle network errors gracefully', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Timeout'));

        const result = await extractor.extract('https://example.com/fail');

        expect(result.success).toBe(false);
        expect(result.content).toBe('');
        expect(result.error).toBe('Network Timeout');
    });
});
