// pages/Home.jsx
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import WhatsNew from "../components/WhatsNew";
import Categories from "../components/Categories";
import Trending from "../components/Trending";
import Footer from "../components/Footer";
import CustomizedOrdersSection from "../components/CustomizedOrder";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WhatsNew />
      <Categories />
      <Trending />
      
      <CustomizedOrdersSection />
      <Footer />
    </>
  );
}