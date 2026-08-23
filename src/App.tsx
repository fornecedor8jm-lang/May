import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { PricingSection } from './components/PricingSection';
import { OrderForm } from './components/OrderForm';
import { OrderTracker } from './components/OrderTracker';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminPanel } from './components/AdminPanel';
import { apiService, INITIAL_SETTINGS } from './services/api';
import { Order, SiteSettings } from './types';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedArtType, setSelectedArtType] = useState<string>('Chibi');
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('inicio');

  // Success modal state
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    order: Order | null;
    whatsappUrl: string;
  }>({
    isOpen: false,
    order: null,
    whatsappUrl: '',
  });

  // Load initial data
  const fetchData = async () => {
    try {
      const [fetchedSettings, fetchedOrders] = await Promise.all([
        apiService.getSettings(),
        apiService.getOrders(),
      ]);
      setSettings(fetchedSettings);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed loading data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // When clicking "Pedir pacote" in the pricing table
  const handleSelectPackage = (packageName: string) => {
    setSelectedArtType(packageName);
    handleNavigate('pedido');
  };

  // When order is submitted
  const handleOrderSuccess = (order: Order, whatsappUrl: string) => {
    setSuccessModal({
      isOpen: true,
      order,
      whatsappUrl,
    });
    fetchData();
  };

  // When user clicks "Track this order" from modal or anywhere
  const handleTrackOrderFromModal = (orderId: string) => {
    setTrackingOrderId(orderId);
    handleNavigate('rastrear');
  };

  // Settings update from admin
  const handleUpdateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = await apiService.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <div className="min-h-screen flex flex-col font-['Quicksand'] bg-[#FFF7FA] text-[#4A3B47] selection:bg-[#FF8FAB]/25">
      {/* Navigation */}
      <Navbar
        settings={settings}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminOpen={isAdminOpen}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <div id="inicio">
          <Hero settings={settings} onNavigate={handleNavigate} />
        </div>

        <HowItWorks />

        <PricingSection
          packages={settings.prices || INITIAL_SETTINGS.prices}
          onSelectPackage={handleSelectPackage}
        />

        <OrderTracker
          initialOrderId={trackingOrderId}
          onSelectOrder={(id) => setTrackingOrderId(id)}
          whatsappNumber={settings.whatsappNumber}
        />

        <OrderForm
          settings={settings}
          selectedArtType={selectedArtType}
          onArtTypeChange={setSelectedArtType}
          onOrderSuccess={handleOrderSuccess}
        />

        <FaqSection />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Celebratory Order Success Modal */}
      <OrderSuccessModal
        isOpen={successModal.isOpen}
        order={successModal.order}
        whatsappUrl={successModal.whatsappUrl}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        onTrackOrder={handleTrackOrderFromModal}
      />

      {/* Artist Admin Management Panel */}
      <AdminPanel
        orders={orders}
        settings={settings}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshOrders={fetchData}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
