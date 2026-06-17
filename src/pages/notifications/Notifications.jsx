import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import NotificationsHeader from './components/NotificationsHeader';
import NotificationsList from './components/NotificationsList';
import NotificationModal from './components/NotificationModal';

export default function Notifications() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();

  const { notifications, unreadCount, markNotificationAsRead } = useAuth();
  
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);

    if (notification.status !== 'Read' && notification.status !== 'read') {
      await markNotificationAsRead(notification.id);
    }
  };

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-0 flex flex-col gap-6 md:gap-8 pb-10">
          
          <NotificationsHeader 
            navigate={navigate} 
            unreadCount={unreadCount} 
          />

          <NotificationsList 
            notifications={notifications}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
            handleNotificationClick={handleNotificationClick}
          />

        </div>
      </div>

      <NotificationModal 
        selectedNotification={selectedNotification}
        setSelectedNotification={setSelectedNotification}
      />
    </div>
  );
}