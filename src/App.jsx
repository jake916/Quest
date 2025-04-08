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

const AppWrapper = () => {
  const location = useLocation()

  return (
    <>
      {location.pathname !== '/dashboard' && 
       location.pathname !== '/mytasks' && 
       location.pathname !== '/projects' && 
       location.pathname !== '/messages' && 
       location.pathname !== '/settings' && 
       location.pathname !== '/createtask' && 
       location.pathname !== '/createproject' && <Header />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password" element={<Password />} />
        <Route path="/passwordreset" element={<Passwordreset />} />
        <Route path="/newpassword" element={<Newpassword />} />
        <Route path="/alldone" element={<Alldone />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/mytasks" element={<PrivateRoute><MyTasks /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/createtask" element={<PrivateRoute><Createtask /></PrivateRoute>} />
        <Route path="/createproject" element={<PrivateRoute><Createproject /></PrivateRoute>} />
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
