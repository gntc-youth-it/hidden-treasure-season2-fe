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

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/treasure/:treasureId" element={<TreasureRoute />} />
        <Route path="/user/:userId" element={<UserRoute />} />
        <Route path="/connect" element={<UserConnectPage />} />
        <Route path="/name" element={<NamePage />} />
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
