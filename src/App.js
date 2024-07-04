import React from 'react';
import {Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SignPage from './SignPage'; 
import Dashboard from './Dashboard';
import SendLocationToThingSpeak from './Location';  
import ThingSpeakDataManagement from './FetchSend';
import Channel3Table from './Channel3';  
import GaugeMeters from './Overview2';


// Your sign page component

function App() {
  return (
  
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign" element={<SignPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Location" element={<SendLocationToThingSpeak />} />
        <Route path="/FetchSend" element={<ThingSpeakDataManagement />} />
        <Route path="/Channel3" element={<Channel3Table />} />
        <Route path="/overview2" element={<GaugeMeters />} />
        
        
      </Routes>
    
  );
}

export default App;
