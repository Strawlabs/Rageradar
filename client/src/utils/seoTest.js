/**
 * SEO Testing Utility
 * Run this in browser console to verify SEO implementation
 */

export const runSEOTest = () => {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Test 1: Title Tag
  const title = document.querySelector('title');
  if (title && title.textContent.length >= 30 && title.textContent.length <= 60) {
    results.passed.push('✓ Title tag exists and is optimal length (30-60 chars)');
  } else if (title) {
    results.warnings.push('⚠ Title tag exists but length is not optimal');
  } else {
    results.failed.push('✗ Title tag is missing');
  }

  // Test 2: Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && metaDesc.content.length >= 120 && metaDesc.content.length <= 160) {
    results.passed.push('✓ Meta description exists and is optimal length (120-160 chars)');
  } else if (metaDesc) {
    results.warnings.push('⚠ Meta description exists but length is not optimal');
  } else {
    results.failed.push('✗ Meta description is missing');
  }

  // Test 3: H1 Tag
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 1) {
    results.passed.push('✓ Exactly one H1 tag found');
  } else if (h1Tags.length === 0) {
    results.failed.push('✗ No H1 tag found');
  } else {
    results.warnings.push(`⚠ Multiple H1 tags found (${h1Tags.length})`);
  }

  // Test 4: Canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    results.passed.push('✓ Canonical URL is set');
  } else {
    results.failed.push('✗ Canonical URL is missing');
  }

  // Test 5: Open Graph Tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogTitle && ogDesc && ogImage) {
    results.passed.push('✓ Open Graph tags are present');
  } else {
    results.failed.push('✗ Some Open Graph tags are missing');
  }

  // Test 6: Twitter Card Tags
  const twitterCard = document.querySelector('meta[property="twitter:card"]');
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterCard && twitterTitle) {
    results.passed.push('✓ Twitter Card tags are present');
  } else {
    results.failed.push('✗ Some Twitter Card tags are missing');
  }

  // Test 7: Structured Data
  const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
  if (structuredData.length > 0) {
    results.passed.push(`✓ Structured data found (${structuredData.length} schemas)`);
  } else {
    results.failed.push('✗ No structured data found');
  }

  // Test 8: Images with Alt Text
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
  if (imagesWithoutAlt.length === 0) {
    results.passed.push('✓ All images have alt text');
  } else {
    results.warnings.push(`⚠ ${imagesWithoutAlt.length} images missing alt text`);
  }

  // Test 9: Mobile Viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    results.passed.push('✓ Mobile viewport meta tag is present');
  } else {
    results.failed.push('✗ Mobile viewport meta tag is missing');
  }

  // Test 10: Language Attribute
  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    results.passed.push(`✓ HTML lang attribute is set (${htmlLang})`);
  } else {
    results.failed.push('✗ HTML lang attribute is missing');
  }

  // Test 11: Heading Hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length > 0) {
    results.passed.push(`✓ Heading structure exists (${headings.length} headings)`);
  } else {
    results.warnings.push('⚠ No heading tags found');
  }

  // Test 12: Internal Links
  const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="#"]');
  if (internalLinks.length > 0) {
    results.passed.push(`✓ Internal links present (${internalLinks.length} links)`);
  } else {
    results.warnings.push('⚠ No internal links found');
  }

  // Test 13: ARIA Labels
  const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
  if (ariaLabels.length > 0) {
    results.passed.push(`✓ ARIA labels present (${ariaLabels.length} elements)`);
  } else {
    results.warnings.push('⚠ No ARIA labels found');
  }

  // Print Results
  console.log('\n🔍 SEO TEST RESULTS\n');
  console.log('═══════════════════════════════════════\n');
  
  if (results.passed.length > 0) {
    console.log('✅ PASSED TESTS:\n');
    results.passed.forEach(test => console.log(test));
    console.log('\n');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    results.warnings.forEach(test => console.log(test));
    console.log('\n');
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED TESTS:\n');
    results.failed.forEach(test => console.log(test));
    console.log('\n');
  }

  const total = results.passed.length + results.warnings.length + results.failed.length;
  const score = Math.round((results.passed.length / total) * 100);

  console.log('═══════════════════════════════════════\n');
  console.log(`📊 SEO SCORE: ${score}%`);
  console.log(`   Passed: ${results.passed.length}`);
  console.log(`   Warnings: ${results.warnings.length}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log('\n═══════════════════════════════════════\n');

  if (score >= 90) {
    console.log('🎉 Excellent! Your SEO is well optimized.');
  } else if (score >= 70) {
    console.log('👍 Good! Address warnings and failures to improve.');
  } else {
    console.log('⚠️  Needs improvement. Review failed tests.');
  }

  return { results, score };
};

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  window.runSEOTest = runSEOTest;
  console.log('💡 Run window.runSEOTest() to check SEO implementation');
}

export default runSEOTest;
