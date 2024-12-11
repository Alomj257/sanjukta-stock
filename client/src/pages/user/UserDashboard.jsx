import React from 'react';
import NotificationSection from './section/NotificationSection';

const UserDashboard = () => {
  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome to your user dashboard. View your details and manage your account here.</p>
      <NotificationSection/>
    </div>
  );
};

export default UserDashboard;
