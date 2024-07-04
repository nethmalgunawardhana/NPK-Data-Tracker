import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/sign');
  };

  return (
    <div className="b1 b1-container" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="row g-4 g-lg-6 g-xl-7 align-items-center justify-content-center text-center">
        <div className="col-12 col-lg-6 order-1 order-lg-0">
        <h2 className="text-success fw-bold mb-x1 text-capitalize welcome-title">
                Welcome to NPK Data tracker
          </h2>
          <h1 className=" text-secondary text-capitalize fw-light mb-4 description">
            "Unlock Your Soil's Potential with Precise <br className="d-none d-md-block d-lg-none" />
            <span className="fw-bold" style={{ color: 'rgb(36, 74, 3)' }}>NPK Tracking!"</span>
          </h1>
          <p></p>
          <button className="btn btn-gradient fs-4 d-inline-flex blinking-button" onClick={handleGetStarted}>
            <span>Get Started</span>
          </button>
        </div>
        <div className="col-12 col-lg-6 order-0 order-lg-1 d-flex justify-content-center">
          <div className='img-fluid' style={{ marginRight: '30px', marginLeft:"30px", marginTop:"20px" }}>
            <img className="img-fluid" src="image4.jpeg" alt="" style={{ width: 'auto', height: 'auto' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;