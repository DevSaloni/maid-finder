import React from 'react'
import HeroSection from '../component/HeroSection';
import OurServices from '../component/OurServices';
import CallToAction from '../component/CallToAction';
import RegisterPanel from '../component/RegisterPanel';
import Feature from "../component/Features";

const Home = () => {
  return (

    <div>
        <HeroSection/>
        <OurServices/>
        <RegisterPanel/>
         <Feature/>
        <CallToAction/>
    </div>
  )
}

export default Home