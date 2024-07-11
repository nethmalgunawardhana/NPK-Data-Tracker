import React, { useState, useEffect } from 'react';
import './FetchSend.css';
import Swal from 'sweetalert2';
import { db } from './firebase'; // Ensure this import points to your Firebase configuration file
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';

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
  const apiKeyReadChannel1 = process.env.REACT_APP_CHANNEL1_API_KEY;
  const apiKeyWriteChannel3 = process.env.REACT_APP_CHANNEL3_WRITE_API_KEY;
  const maxResultsLocation = 15;
  const maxResultsNPK = 50;
  const pollingInterval = 2000;

  useEffect(() => {
    console.log('Environment Variables:', {
      channel1Id,
      apiKeyReadChannel1,
      apiKeyWriteChannel3
    });

    fetchDataAndUpdateTables();
    const interval = setInterval(fetchDataAndUpdateTables, pollingInterval);
    const unsubscribeFirestore = fetchFirestoreData();

    return () => {
      clearInterval(interval);
      unsubscribeFirestore();
    };
  }, []);

  const fetchDataAndUpdateTables = () => {
    fetchData(channel1Id, setLocationData, ['field1', 'field2', 'created_at'], apiKeyReadChannel1, maxResultsLocation);
  };

  const fetchData = (channelId, setData, fields, readApiKey, maxResults) => {
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
          text: 'Failed to fetch location data. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  };

  const fetchFirestoreData = () => {
    const npkRef = collection(db, 'NPK');
    const q = query(npkRef, orderBy('timestamp', 'desc'), limit(maxResultsNPK));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const npkData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Firestore document data:', data);
        
        return {
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
          selected: false
        };
      });
      setNpkData(npkData);
    }, (error) => {
      console.error('Error fetching data from Firestore:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch NPK data from Firestore. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    });

    return unsubscribe;
  };

  const handleCheckboxChange = (index, dataType) => {
    if (dataType === 'location') {
      setLocationData(locationData.map((item, i) => ({...item, selected: i === index ? !item.selected : false})));
    } else {
      setNpkData(npkData.map((item, i) => ({...item, selected: i === index ? !item.selected : false})));
    }
  };

  const addData = () => {
    const selectedLocation = locationData.find(item => item.selected);
    const selectedNPK = npkData.find(item => item.selected);
    
    if (selectedLocation && selectedNPK) {
      updateChannel3Data(
        selectedLocation.field1,
        selectedLocation.field2,
        selectedNPK.nitrogen,
        selectedNPK.phosphorus,
        selectedNPK.potassium
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
          throw new Error('Failed to update Database');
        }
        Swal.fire({
          title: 'Success!',
          text: 'Data successfully added to Database.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      })
      .catch(error => {
        console.error('Error updating Database:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update Database. Please try again later.',
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
          <button className="btn btn-outline-dark me-2" onClick={() => window.location.href='channel3'} type="button">Data table</button>
          <button className="btn btn-outline-dark me-2" onClick={() => window.location.href='Dashboard'} type="button">Dashboard</button>
          <button className="btn btn-sm btn-outline-dark" onClick={() => window.location.href='/'} type="button">Logout</button>
        </form>
      </nav>

      <h1 className="text-center"><u>Database</u></h1>

      <div className="table-container">
        <div>
          <h2>Location Data </h2>
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
          <h2>N, P, K Values </h2>
          <div className="npk-table-container">
            <table id="npkTable">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>N</th>
                  <th>P</th>
                  <th>K</th>
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
                    <td>{item.nitrogen}</td>
                    <td>{item.phosphorus}</td>
                    <td>{item.potassium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <button id="sendButton" onClick={addData}>Add Selected Data to Table</button>
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
        <button id="submit2" onClick={() => window.location.href='channel3'} >See updated Data</button>
      </form>
    </div>
  );
};

export default ThingSpeakDataManagement;