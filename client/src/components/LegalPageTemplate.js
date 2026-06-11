import React from 'react';
import { Link } from 'react-router-dom';

const LegalPageTemplate = ({ title, effectiveDate, children, currentPage }) => {
  const legalPages = [
    { name: 'Terms of Service', path: '/terms', key: 'terms' },
    { name: 'Privacy Policy', path: '/privacy', key: 'privacy' },
    { name: 'Cookie Policy', path: '/cookies', key: 'cookies' },
    { name: 'GDPR Compliance', path: '/gdpr', key: 'gdpr' },
    { name: 'Cancellation Policy', path: '/cancellation', key: 'cancellation' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <Link to="/" className="inline-block group mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-sm">R</span>
                </div>
                <span className="text-xl font-black text-gray-900">RageRadar</span>
              </div>
            </Link>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
              <nav className="space-y-1">
                {legalPages.map((page) => (
                  <Link
                    key={page.key}
                    to={page.path}
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === page.key
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {page.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Content */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {effectiveDate && (
                  <p className="text-gray-600">Effective Date: {effectiveDate}</p>
                )}
              </div>

              <div className="prose prose-gray max-w-none">
                {children}
              </div>
            </div>
          </div>

          {/* Table of Contents - Right Sidebar */}
          <div className="w-64 p-6 bg-white border-l border-gray-200">
            <div className="sticky top-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">On this page</h4>
              <div id="table-of-contents" className="space-y-2 text-sm">
                {/* This will be populated by each page */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPageTemplate;