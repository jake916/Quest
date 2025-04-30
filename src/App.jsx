import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/login'
import MyTasks from './pages/mytasks'
import Projects from './pages/projects'
import Messages from './pages/messages'
import Register from './pages/register'
import Password from './pages/password'
import Passwordreset from './pages/passwordreset'
import Newpassword from './pages/newpassword'
import Header from './Component/header'
import Alldone from './pages/alldone'
import Dashboard from './pages/dashboard'
import Settings from './pages/settings'
import Createtask from './pages/createtask'
import Createproject from './pages/createproject'
import PrivateRoute from "./Component/privateroute";
import Edittask from './pages/edittask';
import Viewproject from './pages/viewproject';
import Editproject from './pages/editproject';
import Notification from './pages/Notification';
import EmailVerification from './pages/EmailVerification';

import OneSignalInit from './Component/OneSignalInit';
import InAppNotification from './Component/InAppNotification';

import useCustomDarkMode from './hooks/useCustomDarkMode';

const AppWrapper = () => {
  const location = useLocation();

  // Global dark mode state
  const [isDarkMode, toggleDarkMode] = useCustomDarkMode();

  return (
    <>
      <OneSignalInit />
      <InAppNotification />
      {location.pathname !== '/dashboard' && 
       location.pathname !== '/mytasks' && 
       location.pathname !== '/projects' && 
       location.pathname !== '/messages' && 
       location.pathname !== '/notifications' &&
       location.pathname !== '/settings' && 
       location.pathname !== '/viewproject' && 
       !location.pathname.startsWith('/edittask') && 
       !location.pathname.startsWith('/editproject') && 
       !location.pathname.startsWith('/viewproject') && 
       location.pathname !== '/createproject' && <Header />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password" element={<Password />} />
        <Route path="/passwordreset" element={<Passwordreset />} />
        <Route path="/newpassword" element={<Newpassword />} />
        <Route path="/alldone" element={<Alldone />} />
        <Route path="/email-verification" element={<EmailVerification />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/mytasks" element={<PrivateRoute><MyTasks isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Projects isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notification isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/createtask" element={<PrivateRoute><Createtask isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/edittask/:taskId" element={<PrivateRoute><Edittask isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/editproject/:projectId" element={<PrivateRoute><Editproject isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/createproject" element={<PrivateRoute><Createproject isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/viewproject" element={<PrivateRoute><Viewproject isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
        <Route path="/viewproject/:id" element={<PrivateRoute><Viewproject isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
      </Routes>
    </>
  )
}

const App = () => {
    return (
        <Router>
            <AppWrapper />
        </Router>
    )
}

export default App;
