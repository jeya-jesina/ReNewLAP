import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/footer";
import Home from "./Pages/Home/Home";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header/>
      <Routes>
        <Route path="/" element={<Home/> } />
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}