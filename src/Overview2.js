import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import './Overview.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';



const GaugeMeters = () => {
  const [chartData, setChartData] = useState([
    ['Label', 'Value'],
    ['Nitrogen', 0],
    ['Phosphorus', 0],
    ['Potassium', 0],
  ]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [userInputs, setUserInputs] = useState({
    Nitrogen: '',
    Phosphorus: '',
    Potassium: ''
  });
  const [comparisonMessage, setComparisonMessage] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const options = {
    width: windowWidth <= 620 ? windowWidth - 40 : 300,
    height: windowWidth <= 620 ? (window.innerHeight - 80) / 3 : 300,
    redFrom: 350, redTo: 400,
    yellowFrom: 200, yellowTo: 350,
    greenFrom: 0, greenTo: 200,
    minorTicks: 5,
    max: 400
  };

  useEffect(() => {
    const docRef = doc(db, "NPK", "DATA");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const newData = [
          ['Label', 'Value'],
          ['Nitrogen', data.nitrogen],
          ['Phosphorus', data.phosphorus],
          ['Potassium', data.potassium],
        ];
        setChartData(newData);
        updateComparisonMessage([data.nitrogen, data.phosphorus, data.potassium]);
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, [userInputs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  };

  const updateComparisonMessage = (newData) => {
    const elements = ['Nitrogen', 'Phosphorus', 'Potassium'];
    let messages = [];

    elements.forEach((element, index) => {
      const fetchedValue = newData[index];
      const userValue = parseFloat(userInputs[element]);

      if (!isNaN(userValue)) {
        let message = '';
        let color = '';

        if (fetchedValue > userValue) {
          message = `Excessiveness of ${element} can lead to environmental pollution.`;
          color = 'red';
        } else if (fetchedValue < userValue) {
          message = `Less of ${element} is bad for the soil.`;
          color = 'red';
        } else {
          message = `${element} level is good.`;
          color = 'green';
        }

        messages.push({ text: message, color: color });
      }
    });

    setComparisonMessage(messages.length > 0 ? messages : [{ text: 'Please enter values for comparison.', color: 'black' }]);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="gauge-container">
        {['Nitrogen', 'Phosphorus', 'Potassium'].map((element, index) => (
          <div key={element} className="gauge">
            <Chart
              chartType="Gauge"
              width={`${options.width}px`}
              height={`${options.height}px`}
              data={[['Label', 'Value'], [element, chartData[index + 1][1]]]}
              options={{...options, title: element}}
            />
            <input
              type="number"
              name={element}
              value={userInputs[element]}
              onChange={handleInputChange}
              placeholder={`Enter ${element} value`}
              style={{
                width: '100%',
                padding: '5px',
                margin: '10px 0',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}
        <div style={{
          backgroundColor: '#f0f0f0',
          padding: '20px',
          marginTop: '30px',
          borderRadius: '10px',
          color:'black',
          fontSize: '18px',
          lineHeight: '1.6',
          maxWidth: '800px',
          margin: '30px auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          height: '315px',
          width: '450px',
          textAlign: 'left'
        }}>
          <strong style={{ fontSize: '35px', display: 'block', marginBottom: '10px'  }}><u>Comparison Result:</u></strong>
          <ul style={{ paddingLeft: '20px' }}>
            {comparisonMessage.map((message, index) => (
              <li key={index} style={{ color: message.color, marginBottom: '10px' }}>
                {message.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GaugeMeters;