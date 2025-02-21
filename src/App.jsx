import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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


const AppWrapper = () => {
  const location = useLocation()
  
  return (
    <>
      {location.pathname !== '/dashboard' && location.pathname !== '/mytasks' && location.pathname !== '/projects' && location.pathname !== '/messages' && location.pathname !== '/settings' &&  <Header />}
      
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password" element={<Password />} />
        <Route path="/passwordreset" element={<Passwordreset />} />
        <Route path="/newpassword" element={<Newpassword />} />
        <Route path="/alldone" element={<Alldone/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/mytasks" element={<MyTasks />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />

        
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

export default App
