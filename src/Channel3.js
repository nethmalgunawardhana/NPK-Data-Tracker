import React, { useState, useEffect } from 'react';
import './Channel3Table.css';

const Channel3Table = () => {
  const [feeds, setFeeds] = useState([]);
  const [error, setError] = useState(null);

  const apiKey = process.env.REACT_APP_CHANNEL3_READ_API_KEY ;
  const channelId = process.env.REACT_APP_CHANNEL3_ID ;
  const fetchInterval = 15000;

  console.log('API Key:', apiKey);
  console.log('Channel ID:', channelId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiKey || !channelId) {
          throw new Error("API key or Channel ID is missing");
        }
        const response = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=100`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFeeds(data.feeds);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, fetchInterval);

    return () => clearInterval(intervalId);
  }, [apiKey, channelId]);

  if (error) {
    return (
      <div>
        <nav className="navbar navbar-light bg-success navbar-left">
          <a className="navbar-brand" href="/">
            <img src="iconb.png" width="45" height="42" className="d-inline-block align-top" alt="" />
            NPK Data Tracker
          </a>
          <form className="ml-auto">
            <button className="btn btn-outline-dark me-2" onClick={() => window.location.href='FetchSend'} type="button">Back</button>
            <button className="btn btn-sm btn-outline-dark" onClick={() => window.location.href='/'} type="button">Logout</button>
          </form>
        </nav>
        <h1>Error</h1>
        <p>Error fetching data: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar navbar-light bg-success navbar-left">
        <a className="navbar-brand" href="/">
          <img src="iconb.png" width="45" height="42" className="d-inline-block align-top" alt="" />
          NPK Data Tracker
        </a>
        <form className="ml-auto">
          <button className="btn btn-outline-dark me-2" onClick={() => window.location.href='FetchSend'} type="button">Back</button>
          <button className="btn btn-sm btn-outline-dark" onClick={() => window.location.href='/'} type="button">Logout</button>
        </form>
      </nav>
      <h1>Real-Time Location Data</h1>
      <table id="dataTable">
        <thead>
          <tr>
            <th>Entry ID</th>
            <th>Timestamp</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>N data</th>
            <th>P data</th>
            <th>K data</th>
          </tr>
        </thead>
        <tbody>
          {feeds.map(feed => (
            <tr key={feed.entry_id}>
              <td>{feed.entry_id}</td>
              <td>{new Date(feed.created_at).toLocaleString()}</td>
              <td>{feed.field1 || "N/A"}</td>
              <td>{feed.field2 || "N/A"}</td>
              <td>{feed.field3 || "N/A"}</td>
              <td>{feed.field4 || "N/A"}</td>
              <td>{feed.field5 || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Channel3Table;