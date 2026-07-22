import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import MentionsExplorer from '../MentionsExplorer';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrandProvider } from '../../contexts/BrandContext';
import { FilterProvider } from '../../contexts/FilterContext';

// Mock contexts right at the module level
const mockCurrentBrand = {
  id: 'test-brand-1',
  brandName: 'Stripe',
  category: 'fintech',
  themes: ['API Reliability', 'Customer Support', 'Pricing'],
  searchResults: [
    {
      id: 'm-1',
      author: 'dev_guru',
      text: 'Stripe webhook docs are amazing but we had a critical API outage today during peak hours!',
      platform: 'twitter',
      timestamp: new Date(Date.now() - 1000).toISOString(),
      rageIndex: 85,
      sentiment: 'negative',
      emotion: 'anger',
      emotions: [{ label: 'anger', score: 0.9 }],
      keywords: ['Stripe', 'outage', 'API'],
      themes: ['API Reliability'],
      influence: 'high',
      url: 'https://twitter.com/dev_guru/status/1'
    },
    {
      id: 'm-2',
      author: 'dev_guru_dupe',
      text: 'Stripe webhook docs are amazing but we had a critical API outage today during peak hours!',
      platform: 'twitter',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      rageIndex: 85,
      sentiment: 'negative',
      emotion: 'anger',
      emotions: [{ label: 'anger', score: 0.9 }],
      keywords: ['Stripe', 'outage'],
      themes: ['API Reliability'],
      influence: 'high',
      url: 'https://twitter.com/dev_guru/status/2' // distinct URL, but identical content for clustering
    },
    {
      id: 'm-3',
      author: 'happy_user',
      text: 'Super impressed with Stripe Checkout flow! Increased our conversion rate significantly.',
      platform: 'reddit',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      rageIndex: 12,
      sentiment: 'positive',
      emotion: 'joy',
      emotions: [{ label: 'joy', score: 0.95 }],
      keywords: ['Stripe', 'conversion'],
      themes: ['Pricing'],
      influence: 'medium',
      url: 'https://reddit.com/r/stripe/comments/1'
    }
  ]
};

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    currentUser: { id: 'user-1', email: 'admin@rageradar.ai', role: 'admin' }
  })
}));

jest.mock('../../contexts/BrandContext', () => ({
  ...jest.requireActual('../../contexts/BrandContext'),
  useBrand: () => ({
    currentBrand: mockCurrentBrand,
    loading: false
  })
}));

describe('MentionsExplorer Enhanced Capabilities', () => {
  const renderWithProviders = (ui) => {
    return render(
      <MemoryRouter>
        <FilterProvider>
          {ui}
        </FilterProvider>
      </MemoryRouter>
    );
  };

  test('renders Mentions Explorer with clustering and deduplication active by default', async () => {
    renderWithProviders(<MentionsExplorer />);

    expect(await screen.findByText(/Mentions Explorer/i)).toBeInTheDocument();
    
    // Check that clustering toggle exists and is checked
    const clusterCheckbox = screen.getByRole('checkbox', { name: /Cluster Similar & Duplicate Messages/i });
    expect(clusterCheckbox).toBeInTheDocument();
    expect(clusterCheckbox).toBeChecked();

    // With clustering active, m-1 and m-2 should be clustered into 1 representative item showing +1 similar
    expect(screen.getByText(/\+1 similar across platforms/i)).toBeInTheDocument();
  });

  test('toggling clustering off reveals all individual duplicate items', async () => {
    renderWithProviders(<MentionsExplorer />);

    const clusterCheckbox = await screen.findByRole('checkbox', { name: /Cluster Similar & Duplicate Messages/i });
    expect(clusterCheckbox).toBeChecked();

    // Click toggle to disable clustering
    fireEvent.click(clusterCheckbox);
    expect(clusterCheckbox).not.toBeChecked();

    // Now both dev_guru and dev_guru_dupe should be listed separately without the +1 similar badge
    expect(screen.queryByText(/\+1 similar across platforms/i)).not.toBeInTheDocument();
  });

  test('clicking a mention card opens the Mention Investigation Drawer with exact breakdown', async () => {
    renderWithProviders(<MentionsExplorer />);

    // Click on the first mention card (dev_guru)
    const authorElement = await screen.findByText('dev_guru');
    fireEvent.click(authorElement);

    // Verify modal drawer opens
    expect(await screen.findByText(/Original Post Content/i)).toBeInTheDocument();
    expect(screen.getByText(/Rage Index Gauge/i)).toBeInTheDocument();
    expect(screen.getByText(/Detected Emotions/i)).toBeInTheDocument();
    expect(screen.getByText(/Engagement Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Clustered Similar & Duplicate Posts/i)).toBeInTheDocument();

    // Close the drawer
    const closeBtn = screen.getByText('Close Drawer');
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Original Post Content/i)).not.toBeInTheDocument();
  });
});
