import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Basic components first
import Loading from './components/Loading';
import NotFound from './components/NotFound';
import Auth from './components/Auth';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPasswordForm from './components/ResetPasswordForm';
import PrivateRoute from './components/PrivateRoute';

// Context providers
import { AuthProvider } from './contexts/AuthContext';
import { BrandProvider } from './contexts/BrandContext';
import { FilterProvider } from './contexts/FilterContext';
import { ThemeProvider } from './components/theme-provider';

// SEO Components
import BreadcrumbSchema from './components/BreadcrumbSchema';

// Landing pages
import LandingPage from './components/LandingPage';
import KimolaStyleLandingPage from './components/KimolaStyleLandingPage';
import ProfessionalLandingPage from './components/ProfessionalLandingPage';

// Legal pages
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CookiePolicy from './components/CookiePolicy';
import GDPRCompliance from './components/GDPRCompliance';
import CancellationPolicy from './components/CancellationPolicy';

// Support pages
import Documentation from './components/Documentation';
import ContactSupport from './components/ContactSupport';
import Blog from './components/Blog';
import BlogManagement from './components/BlogManagement';

// Admin components
import UserManagement from './components/UserManagement';
import RBACSettings from './components/RBACSettings';
import AdminTest from './components/AdminTest';

// Dashboard components
import EnhancedLayout from './components/EnhancedLayout';
import CleanModernDashboard from './components/CleanModernDashboard';
import AnalysisPage from './components/AnalysisPage';

// Report components
import ReportsOverview from './components/ReportsOverview';
import ReportsAnalysis from './components/ReportsAnalysis';
import ReportsTrends from './components/ReportsTrends';
import MentionsExplorer from './components/MentionsExplorer';
import CompetitiveAnalysis from './components/CompetitiveAnalysis';

// Phase 3 Components
import AlertsDashboard from './components/AlertsDashboard';
import ExportsDashboard from './components/ExportsDashboard';
import SettingsDashboard from './components/SettingsDashboard';

// Billing Components
import PricingPlans from './components/PricingPlans';

// Phase 4 Components
import EnhancedAIInsightsEngine from './components/EnhancedAIInsightsEngine';
import RealTimeIntelligence from './components/RealTimeIntelligence';

// Platform Integrations
import PlatformIntegrationsDashboard from './components/PlatformIntegrationsDashboard';

// Production Build Components

// Utils
import { performanceMonitor } from './utils/performanceMonitor';

// Enterprise UI Components (Optional - can be enabled later)
// import EnterpriseLayout from './components/EnterpriseLayout';
// import EnterpriseDashboard from './components/EnterpriseDashboard';
// import EnterpriseReports from './components/EnterpriseReports';
// import EnterpriseAnalysis from './components/EnterpriseAnalysis';
// import EnterpriseMentions from './components/EnterpriseMentions';
// import EnterpriseSites from './components/EnterpriseSites';
// import EnterpriseSettings from './components/EnterpriseSettings';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate app initialization
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate loading time for app initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <Loading 
        message="Initializing RageRadar" 
        subMessage="Preparing your emotional intelligence dashboard"
      />
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="rageradar-ui-theme">
      <AuthProvider>
        <BrandProvider>
          <FilterProvider>
            <Router>
            <BreadcrumbSchema />
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<KimolaStyleLandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/professional" element={<ProfessionalLandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/password-reset" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                
                {/* Legal Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/gdpr" element={<GDPRCompliance />} />
                <Route path="/cancellation" element={<CancellationPolicy />} />
                
                {/* Support Pages */}
                <Route path="/docs" element={<Documentation />} />
                <Route path="/support" element={<ContactSupport />} />
                <Route path="/blog" element={<Blog />} />
                
                {/* Admin Routes */}
                <Route path="/admin/blog" element={
                  <PrivateRoute requiredRoles={['admin', 'super_admin']}>
                    <EnhancedLayout>
                      <BlogManagement />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                <Route path="/admin/users" element={
                  <PrivateRoute requiredRoles={['admin', 'super_admin']}>
                    <EnhancedLayout>
                      <UserManagement />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                <Route path="/admin/rbac" element={
                  <PrivateRoute requiredRoles={['admin', 'super_admin']}>
                    <EnhancedLayout>
                      <RBACSettings />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                <Route path="/admin/test" element={
                  <PrivateRoute requiredRoles={['admin', 'super_admin']}>
                    <EnhancedLayout>
                      <AdminTest />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <CleanModernDashboard />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/analyze" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <AnalysisPage />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/reports/overview" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <ReportsOverview />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/reports/analysis" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <ReportsAnalysis />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/reports/trends" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <ReportsTrends />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />

                <Route path="/dashboard/reports/mentions" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <MentionsExplorer />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/reports/competitive" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <CompetitiveAnalysis />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/alerts" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <AlertsDashboard />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/exports" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <ExportsDashboard />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/settings" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <SettingsDashboard />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/pricing" element={<PricingPlans />} />
                
                <Route path="/dashboard/ai-insights" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <EnhancedAIInsightsEngine />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/integrations" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <PlatformIntegrationsDashboard />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard/real-time" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <RealTimeIntelligence />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/analysis" element={
                  <PrivateRoute>
                    <EnhancedLayout>
                      <AnalysisPage />
                    </EnhancedLayout>
                  </PrivateRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
          </FilterProvider>
        </BrandProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;