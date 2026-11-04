/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { PersonalizePage } from './pages/PersonalizePage';
import { DesignDetailPage } from './pages/DesignDetailPage';
import { PreviewPage } from './pages/PreviewPage';
import { TailorDiscoveryPage } from './pages/TailorDiscoveryPage';
import { TailorDetailPage } from './pages/TailorDetailPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrdersListPage } from './pages/OrdersListPage';
import { AdminPage } from './pages/AdminPage';
import { TailorDashboardPage } from './pages/TailorDashboardPage';

const AppRouter: React.FC = () => {
  const { currentRoute, user, isAuthenticated } = useApp();

  const renderRoute = () => {
    // 1. If not authenticated, always render Login page (Landing = Login)
    if (!user || !isAuthenticated) {
      return <LoginPage />;
    }

    // 2. When logged in, route '/' or '/login' directly to respective dashboard
    if (currentRoute === '/' || currentRoute === '' || currentRoute === '/login') {
      if (user.role === 'tailor') {
        return <TailorDashboardPage />;
      }
      if (user.role === 'admin') {
        return <AdminPage />;
      }
      return <DashboardPage />;
    }

    // 3. User Dashboard
    if (currentRoute === '/dashboard') {
      if (user.role === 'tailor') return <TailorDashboardPage />;
      if (user.role === 'admin') return <AdminPage />;
      return <DashboardPage />;
    }

    // 4. Tailor Workspace
    if (currentRoute === '/tailor' || currentRoute === '/tailor/dashboard') {
      return <TailorDashboardPage />;
    }

    // 5. Admin Center
    if (currentRoute === '/admin') {
      return <AdminPage />;
    }

    // 6. Kurti Design & Customization Flow
    if (currentRoute === '/upload') {
      return <UploadPage />;
    }
    if (currentRoute === '/recommendations' || currentRoute === '/analyze') {
      return <RecommendationsPage />;
    }
    if (currentRoute === '/personalize') {
      return <PersonalizePage />;
    }
    if (currentRoute.startsWith('/design/')) {
      return <DesignDetailPage />;
    }
    if (currentRoute === '/preview' || currentRoute.startsWith('/preview/')) {
      return <PreviewPage />;
    }

    // 7. Tailor Discovery & Directory
    if (currentRoute === '/tailors') {
      return <TailorDiscoveryPage />;
    }
    if (currentRoute.startsWith('/tailors/')) {
      return <TailorDetailPage />;
    }

    // 8. Order Placement & Tracking
    if (currentRoute === '/order' || currentRoute === '/order/new') {
      return <CreateOrderPage />;
    }
    if (currentRoute === '/orders') {
      return <OrdersListPage />;
    }
    if (currentRoute.startsWith('/orders/')) {
      return <OrderTrackingPage />;
    }

    // Default fallback to respective dashboard
    if (user.role === 'tailor') return <TailorDashboardPage />;
    if (user.role === 'admin') return <AdminPage />;
    return <DashboardPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8EDE9] text-[#2E2926] font-sans selection:bg-[#F2C3B9] selection:text-[#B5563E]">
      <Navbar />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

