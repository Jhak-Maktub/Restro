import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { FeaturesSection } from './components/FeaturesSection';
import { DashboardPreview } from './components/DashboardPreview';
import { PricingSection } from './components/PricingSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { InfoModal } from './components/InfoModal';
import { Dashboard } from './components/Dashboard';
import { UpgradeSuccess } from './components/UpgradeSuccess';
import { UpgradeCancel } from './components/UpgradeCancel';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Simple Router Logic for Stripe Redirects
  const path = window.location.pathname;

  if (path.includes('/upgrade/success')) {
    return (
      <React.StrictMode>
        <UpgradeSuccess />
      </React.StrictMode>
    );
  }

  if (path.includes('/upgrade/cancel')) {
    return (
      <React.StrictMode>
        <UpgradeCancel />
      </React.StrictMode>
    );
  }

  // If user is logged in, show the Dashboard System
  if (isAuthenticated) {
    return (
      <>
        <Dashboard />
        <InfoModal />
        <AuthModal /> 
        {/* AuthModal kept for logout confirmation or future re-auth needs if designed */}
      </>
    );
  }

  // If not logged in, show the Landing Page
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <DashboardPreview />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
      <AuthModal />
      <InfoModal />
    </div>
  );
};

export default App;