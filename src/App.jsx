import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams
} from "react-router-dom";
import TreasureImage from "./components/TreasureImage.jsx";
import MainPage from "./components/MainPage.jsx";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/treasure/:treasureId" element={<TreasureRoute />} />
        <Route path="/user/:userId" element={<UserRoute />} />
      </Routes>
    </Router>
  )
}

const TreasureRoute = () => {
  const { treasureId} = useParams();
  return <TreasureImage treasureId={parseInt(treasureId, 10)} />;
}

const UserRoute = () => {
  const { userId } = useParams();
  return <UserImage userId={parseInt(userId, 10)} />;
}
export default App
