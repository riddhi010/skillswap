import React from "react";
import Header from "../components/Header";
import LearnSection from "../components/LearnSection";
import ShareSection from "../components/ShareSection";
import AboutSection from "../components/AboutSection";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import Footer from "../components/Footer";
import Tilt from 'react-parallax-tilt';

const Home = () => (
  <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-600 to-indigo-900 text-gray-100 font-sans">
    <Header />
    <section id="home" className="grid grid-cols-1 md:grid-cols-2 px-6 md:px-16 py-20 gap-16 bg-white/5">
  <Tilt
    glareEnable={true}
    glareMaxOpacity={0.2}
    glareColor="#ffffff"
    glarePosition="all"
    tiltMaxAngleX={10}
    tiltMaxAngleY={10}
    className="rounded-3xl"
  >
    <LearnSection />
  </Tilt>

  <Tilt
    glareEnable={true}
    glareMaxOpacity={0.2}
    glareColor="#ffffff"
    glarePosition="all"
    tiltMaxAngleX={10}
    tiltMaxAngleY={10}
    className="rounded-3xl"
  >
    <ShareSection />
  </Tilt>
</section>
    <AboutSection />
    <FeaturesSection />
    <TestimonialsCarousel />
    <Footer />
  </div>
);

export default Home;
