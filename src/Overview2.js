import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import './Overview.css';

const GaugeMeters = () => {
  const [chartData, setChartData] = useState([
    ['Label', 'Value'],
    ['Nitrogen', 0],
    ['Phosphorus', 0],
    ['Potassium', 0],
  ]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
    const fetchData = async () => {
      const channelID = '2525297';
      const readAPIKey = 'IT6C7L8OKXB6KZ9B';
      const fields = [1, 2, 3];

      try {
        const newData = await Promise.all(
          fields.map(async (field) => {
            const url = `https://api.thingspeak.com/channels/${channelID}/fields/${field}/last.json?api_key=${readAPIKey}`;
            const response = await fetch(url);
            const data = await response.json();
            return parseFloat(data[`field${field}`]);
          })
        );

        setChartData([
          ['Label', 'Value'],
          ['Nitrogen', newData[0]],
          ['Phosphorus', newData[1]],
          ['Potassium', newData[2]],
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 500);

    return () => clearInterval(interval);
  }, []);

  return (
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
        </div>
      ))}
    </div>
  );
};

export default GaugeMeters;