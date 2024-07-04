import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="b4 b4-container">
      <nav className="navbar navbar-light bg-success" style={{ padding: '15px 40px' }}>
        <div className="navbar-left" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
          <Link className="navbar-brand" to="#">
            <img src="iconb.png" width="45" height="42" className="d-inline-block align-top" alt="" />
            NPK Data Tracker
          </Link>
        </div>
        <div className="ml-auto">
          <Link to="/Overview2" className="btn btn-outline-dark me-2">Overview</Link>
          <Link to="/" className="btn btn-sm btn-outline-dark">Logout</Link>
        </div>
      </nav>

      <div className="b3 b3-container">
        <div className="row">
          {[
            { title: "NPK Data", image: "npkimage.avif", text: "Maximize yield with real-time NPK monitoring for healthier plants.", link: "/Overview2", buttonText: "See Data" },
            { title: "Database", image: "database.jpeg", text: "Efficiently store, analyze, and access real-time NPK data securely.", link: "/FetchSend", buttonText: "See Data" },
            { title: "Location", image: "location.jpeg", text: "Enhance crop health with real-time NPK monitoring tailored to your location.", link: "/Location", buttonText: "Send and See Location" }
          ].map((card, index) => (
            <div className="col-lg-4 col-md-6 mb-4" key={index}>
              <div className="card custom-card">
                <img src={card.image} className="card-img-top" alt={card.title} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{card.title}</h5>
                  <p className="card-text">{card.text}</p>
                  <Link to={card.link} className="btn btn-success pulse-btn ">{card.buttonText}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;