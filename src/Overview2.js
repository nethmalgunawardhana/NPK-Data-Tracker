import React, { useState, useEffect, useCallback } from 'react';
import { Chart } from 'react-google-charts';
import './Overview.css';
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

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
  const [comparisonMessage, setComparisonMessage] = useState([{ text: 'Please enter values for comparison.', color: 'black' }]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [latestDocumentId, setLatestDocumentId] = useState(null);

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

  const updateComparisonMessage = useCallback(() => {
    const elements = ['Nitrogen', 'Phosphorus', 'Potassium'];
    let messages = [];

    elements.forEach((element, index) => {
      const fetchedValue = chartData[index + 1][1];
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

    console.log('Updating comparison message:', messages);
    setComparisonMessage(messages.length > 0 ? messages : [{ text: 'Please enter values for comparison.', color: 'black' }]);
  }, [chartData, userInputs]);

  const fetchData = async () => {
    try {
      const npkRef = collection(db, 'NPK');
      const q = query(npkRef, orderBy('timestamp', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const newData = [
          ['Label', 'Value'],
          ['Nitrogen', parseInt(data.nitrogen)],
          ['Phosphorus', parseInt(data.phosphorus)],
          ['Potassium', parseInt(data.potassium)],
        ];
        console.log('Fetched new data:', newData);
        setChartData(newData);
        setLatestDocumentId(doc.id);
      }
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      await fetchData();
      setIsInitialLoading(false);
    };

    initialFetch();

    const intervalId = setInterval(fetchData, 500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    updateComparisonMessage();
  }, [chartData, userInputs, updateComparisonMessage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setUserInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {isInitialLoading ? (
        <p>Loading...</p>
      ) : (
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
            minHeight: '315px',
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
          {latestDocumentId && (
            <p>Latest Document ID: {latestDocumentId}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GaugeMeters;