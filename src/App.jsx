import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams
} from "react-router-dom";
import TreasureImage from "./components/TreasureImage.jsx";
import MainPage from "./components/MainPage.jsx";
import UserImage from "./components/UserImage.jsx";
import UserConnectPage from "./components/UserConnectPage.jsx";
import NamePage from "./components/NamePage.jsx";
import QRScanPage from "./components/QRScanPage.jsx";
import CatcherPage from "./components/CatcherPage.jsx";
import RankingPage from "./components/RankingPage.jsx";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/treasure/:treasureId" element={<TreasureRoute />} />
        <Route path="/user/:userId" element={<UserRoute />} />
        <Route path="/connect" element={<UserConnectPage />} />
        <Route path="/name" element={<NamePage />} />
        <Route path="/scan" element={<QRScanPage />} />
        <Route path="/catcher" element={<CatcherPage />} />
        <Route path="/ranking" element={<RankingPage />} />
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
