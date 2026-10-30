
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Processing from "./pages/Processing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/processing" element={<Processing />} />
  <Route path="/workspace" element={<Workspace />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;
