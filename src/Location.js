import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const SendLocationToThingSpeak = () => {

  useEffect(() => {
    loadGoogleMapScript();
  }, []);

  const loadGoogleMapScript = () => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  };

  const initMap = () => {
    getLocation();
  };

  const sendLocationToThingSpeak = (latitude, longitude) => {
    const apiKey = process.env.REACT_APP_CHANNEL1_WRITE_API_KEY;
    const url = `https://api.thingspeak.com/update?api_key=${apiKey}&field1=${latitude}&field2=${longitude}`;

    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error('Failed to send data to ThingSpeak');
        }
      })
      .then(data => {
        console.log('Successfully sent data to ThingSpeak:', data);
        Swal.fire({
          title: 'Success!',
          text: 'Location sent to ThingSpeak successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to send location data to ThingSpeak.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, error => {
        console.error('Error getting location:', error);
        Swal.fire({
          title: 'Error!',
          text: `Error getting location: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      Swal.fire({
        title: 'Error!',
        text: 'Geolocation is not supported by this browser.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const showPosition = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`);

    // Show the location on the map
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: latitude, lng: longitude },
      zoom: 15
    });

    const marker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map
    });

    // Send the location data to ThingSpeak
    sendLocationToThingSpeak(latitude, longitude);
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-success navbar-left">
        <a className="navbar-brand" href="#">
          <img src="iconb.png" width="45" height="42" className="d-inline-block align-top" alt="" />
          NPK Data Tracker
        </a>
        <div className="ml-auto">
                <Link to="/Dashboard" className="btn btn-outline-dark me-2">Dashboard</Link>
                <Link to="/" className="btn btn-sm btn-outline-dark">Logout</Link>
            </div>
      </nav>
      <p>Fetching your location and sending it to ThingSpeak...</p>
      <div id="map" style={{ width: '100%', height: '550px' }}></div>
    </div>
  );
};

export default SendLocationToThingSpeak;
