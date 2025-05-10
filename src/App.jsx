import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams
} from "react-router-dom";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/treasure/:treasureId" element={<TreasureRoute />} />
      </Routes>
    </Router>
  )
}

const TreasureRoute = () => {
  const { treasureId} = useParams();
  return <TreasureImage treasureId={parseInt(treasureId, 10)} />;
}
export default App
