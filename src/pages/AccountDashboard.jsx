//  src/pages/AccountDashboard.js

import React, { useState } from 'react';
import Sidebar from './Sidebar'; // We'll create this next
import AddressBook from './pages/AddressBook';
import OrdersPage from './pages/OrdersPage';
import MyAccountInfo from './pages/MyAccountInfo'; // A placeholder for your main account details

// This component wraps your entire account section
export default function AccountDashboard() {
  // State to manage the main view: 'account', 'orders', or 'address'
  const [mainView, setMainView] = useState('account');

  // State to manage the sub-view within AddressBook: 'list' or 'form'
  const [addressView, setAddressView] = useState('list');

  const handleNavigate = (view) => {
    setMainView(view);
    // When navigating to the address section, always default to the list view
    if (view === 'address') {
      setAddressView('list');
    }
  };
  
  const handleAddressViewSwitch = (subView) => {
    setAddressView(subView);
  };

  const renderContent = () => {
    switch (mainView) {
      case 'orders':
        return <OrdersPage />;
      case 'address':
        // AddressBook's view is now controlled by the 'addressView' state
        return <AddressBook initialView={addressView} onSwitchView={handleAddressViewSwitch} />;
      case 'account':
      default:
        return <MyAccountInfo />;
    }
  };

  return (
    <div className="address-page-wrapper">
      <Sidebar
        activeView={mainView}
        onNavigate={handleNavigate}
        onAddressSubNavigate={handleAddressViewSwitch}
      />
      <div className="address-content">
        {renderContent()}
      </div>
    </div>
  );
}
