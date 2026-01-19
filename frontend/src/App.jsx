import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FirstLayer from "./components/FirstLayer";
import SecondLayer from "./components/SecondLayer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstLayer />} />
        <Route path="/layer2" element={<SecondLayer />} />
      </Routes>
    </Router>
  );
}

export default App;
