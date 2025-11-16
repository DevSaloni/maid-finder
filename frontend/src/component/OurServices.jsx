import React from 'react';
import "./OurServices.css";

const OurServices = () => {
  return (
    <div className="service-container">
      <h1 className="service-title">Our Services</h1>
      
      <div className="service-grid">
        <div className="card">
          <img src="/images/seniorcare.jpeg" alt="Senior Care"/>
          <h3>Senior Care</h3>
          <p>
            Compassionate and reliable caregivers dedicated to supporting seniors with daily assistance, 
            healthcare guidance, and emotional well-being.
          </p>
        </div>

        <div className="card">
          <img src="/images/babycare.png" alt="Baby Care"/>
          <h3>Baby Care</h3>
          <p>
            Trusted nannies and babysitters offering safe, nurturing, and personalized care for infants 
            and children while parents are away.
          </p>
        </div>

        <div className="card">
          <img src="/images/housekeeping.jpeg" alt="Housekeeping"/>
          <h3>Housekeeping</h3>
          <p>
            Professional housekeeping services to maintain a clean, organized, and stress-free home 
            environment tailored to your needs.
          </p>
        </div>

        <div className="card">
          <img src="/images/cooking.jpg" alt="Cooking"/>
          <h3>Cooking</h3>
          <p>
            Skilled cooks preparing healthy, delicious, and customized meals at home, ensuring both 
            taste and nutrition for your family.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
