import React, { useState, useEffect } from 'react';
import './FetchSend.css';
import Swal from 'sweetalert2';


const ThingSpeakDataManagement = () => {
  const [locationData, setLocationData] = useState([]);
  const [npkData, setNpkData] = useState([]);
  const [manualData, setManualData] = useState({
    latitude: '',
    longitude: '',
    nValue: '',
    pValue: '',
    kValue: ''
  });

  const channel1Id = process.env.REACT_APP_CHANNEL1_ID;
  const channel2Id = process.env.REACT_APP_CHANNEL2_ID;
  const apiKeyReadChannel1 = process.env.REACT_APP_CHANNEL1_API_KEY;
  const apiKeyReadChannel2 = process.env.REACT_APP_CHANNEL2_API_KEY;
  const apiKeyWriteChannel3 = process.env.REACT_APP_CHANNEL3_WRITE_API_KEY;
  const maxResults = 15;
  const pollingInterval = 15000;

  useEffect(() => {
    console.log('Environment Variables:', {
      channel1Id,
      channel2Id,
      apiKeyReadChannel1,
      apiKeyReadChannel2,
      apiKeyWriteChannel3
    });

    fetchDataAndUpdateTables();
    const interval = setInterval(fetchDataAndUpdateTables, pollingInterval);
    return () => clearInterval(interval);
  }, []);

  const fetchDataAndUpdateTables = () => {
    fetchData(channel1Id, setLocationData, ['field1', 'field2', 'created_at'], apiKeyReadChannel1);
    fetchData(channel2Id, setNpkData, ['field1', 'field2', 'field3', 'created_at'], apiKeyReadChannel2);
  };

  const fetchData = (channelId, setData, fields, readApiKey) => {
    if (!channelId || !readApiKey) {
      console.error('Missing channel ID or API key');
      return;
    }
    
    fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=${maxResults}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data.feeds.map(feed => ({
          ...feed,
          created_at: new Date(feed.created_at).toLocaleString(),
          selected: false
        })));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch data. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  };

  const handleCheckboxChange = (index, dataType) => {
    if (dataType === 'location') {
      setLocationData(locationData.map((item, i) => ({...item, selected: i === index})));
    } else {
      setNpkData(npkData.map((item, i) => ({...item, selected: i === index})));
    }
  };

  const addData = () => {
    const selectedLocation = locationData.find(item => item.selected);
    const selectedNPK = npkData.find(item => item.selected);
    
    if (selectedLocation && selectedNPK) {
      updateChannel3Data(
        selectedLocation.field1,
        selectedLocation.field2,
        selectedNPK.field1,
        selectedNPK.field2,
        selectedNPK.field3
      );
    } else {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select one row from each table.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  };

  const updateChannel3Data = (latitude, longitude, nValue, pValue, kValue) => {
    if (!apiKeyWriteChannel3) {
      console.error('Missing Channel 3 API key');
      Swal.fire({
        title: 'Error!',
        text: 'Configuration error. Please contact support.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return Promise.reject('Missing API key');
    }

    const params = new URLSearchParams({
      api_key: apiKeyWriteChannel3,
      field1: latitude,
      field2: longitude,
      field3: nValue,
      field4: pValue,
      field5: kValue
    });

    return fetch(`https://api.thingspeak.com/update?${params}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data === 0) {
          throw new Error('Failed to update Channel 3');
        }
        Swal.fire({
          title: 'Success!',
          text: 'Data successfully added to Channel 3.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      })
      .catch(error => {
        console.error('Error updating Channel 3:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update Channel 3. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  };

  const handleManualInputChange = (e) => {
    setManualData({...manualData, [e.target.name]: e.target.value});
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    updateChannel3Data(
      manualData.latitude,
      manualData.longitude,
      manualData.nValue,
      manualData.pValue,
      manualData.kValue
    ).then(() => {
      setManualData({
        latitude: '',
        longitude: '',
        nValue: '',
        pValue: '',
        kValue: ''
      });
    }).catch(error => {
      console.error('Error in manual submit:', error);
    });
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-success navbar-left">
        <a className="navbar-brand" href="/">
          <img src="iconb.png" width="45" height="42" className="d-inline-block align-top" alt="" />
          NPK Data Tracker
        </a>
        <form className="ml-auto">
          <button className="btn btn-outline-dark me-2" onClick={() => window.location.href='channel3'} type="button">Channel3</button>
          <button className="btn btn-outline-dark me-2" onClick={() => window.location.href='Dashboard'} type="button">Dashboard</button>
          <button className="btn btn-sm btn-outline-dark" onClick={() => window.location.href='/'} type="button">Logout</button>
        </form>
      </nav>

      <h1 className="text-center"><u>ThingSpeak Data Management</u></h1>

      <div className="table-container ">
        <div>
          <h2>Location Data (Channel 1)</h2>
          <table id="locationTable">
            <thead>
              <tr>
                <th>Select</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {locationData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleCheckboxChange(index, 'location')}
                    />
                  </td>
                  <td>{item.field1}</td>
                  <td>{item.field2}</td>
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2>N, P, K Values (Channel 2)</h2>
          <table id="npkTable">
            <thead>
              <tr>
                <th>Select</th>
                <th>N</th>
                <th>P</th>
                <th>K</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {npkData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleCheckboxChange(index, 'npk')}
                    />
                  </td>
                  <td>{item.field1}</td>
                  <td>{item.field2}</td>
                  <td>{item.field3}</td>
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="container-fluid">
        <button id="sendButton" onClick={addData}>Add Selected Data to Channel 3</button>
      </div>

      <hr className="divider" />

      <h2 id="caption">Manual Update to Channel 3</h2>
      <form id="manualUpdateForm" onSubmit={handleManualSubmit}>
        <label htmlFor="latitude">Latitude:</label>
        <input type="text" id="latitude" name="latitude" value={manualData.latitude} onChange={handleManualInputChange} required />
        <label htmlFor="longitude">Longitude:</label>
        <input type="text" id="longitude" name="longitude" value={manualData.longitude} onChange={handleManualInputChange} required />
        <label htmlFor="nValue">N Value:</label>
        <input type="number" id="nValue" name="nValue" value={manualData.nValue} onChange={handleManualInputChange} required />
        <label htmlFor="pValue">P Value:</label>
        <input type="number" id="pValue" name="pValue" value={manualData.pValue} onChange={handleManualInputChange} required />
        <label htmlFor="kValue">K Value:</label>
        <input type="number" id="kValue" name="kValue" value={manualData.kValue} onChange={handleManualInputChange} required />
        <button id="submit" type="submit">Update Channel 3</button>
      </form>
    </div>
  );
};

export default ThingSpeakDataManagement;