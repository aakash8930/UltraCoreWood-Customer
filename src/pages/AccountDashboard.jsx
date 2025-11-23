//  src/pages/AccountDashboard.js

import React, { useState, useEffect } from 'react';
import AddressBook from './AddressBook';
import OrdersPage from './OrdersPage';
import MyAccount from './MyAccount';
import { useLocation } from 'react-router-dom';
import '../css/AddressBook.css';

// This component handles account views without sidebar
export default function AccountDashboard() {
  const location = useLocation();
  const [mainView, setMainView] = useState('account');
  const [addressView, setAddressView] = useState('list');

  // Handle navigation from URL state (from dropdown clicks)
  useEffect(() => {
    if (location.state?.defaultTab) {
      const tab = location.state.defaultTab;
      setMainView(tab);
      
      // Set address view based on specific address action
      if (tab === 'savedAddresses') {
        setAddressView('list');
      } else if (tab === 'addAddress') {
        setAddressView('form');
      }
    }
  }, [location.state]);

  const handleAddressViewSwitch = (subView) => {
    setAddressView(subView);
  };

  const renderContent = () => {
    switch (mainView) {
      case 'orders':
        return <OrdersPage />;
      case 'address':
      case 'savedAddresses':
      case 'addAddress':
        return <AddressBook initialView={addressView} onSwitchView={handleAddressViewSwitch} />;
      case 'account':
      default:
        return <MyAccount />;
    }
  };

  return (
    <div className="account-dashboard-wrapper">
      <div className="account-content">
        {renderContent()}
      </div>
    </div>
  );
}
