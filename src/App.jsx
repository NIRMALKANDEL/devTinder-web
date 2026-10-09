import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Body from "./Components/Body";
import Login from "./Components/Login";
import Profile from "./Components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./Components/Feed";
import Connections from "./Components/Connections";
import Requests from "./Components/Requests";
import ResetPassword from "./Components/ResetPassword";
import NotFound from "./Components/NotFound";
import ConnectionProfile from "./Components/ConnectionProfile";
function App() {
  return (
    <>
      <Provider store={appStore}>
        {/* UI: Motion follows the OS "reduce motion" setting everywhere */}
        <MotionConfig reducedMotion='user'>
          <BrowserRouter basename='/'>
            <Routes>
              <Route path='/' element={<Body />}>
                <Route path='/' element={<Feed />} />
                <Route path='/login' element={<Login />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/connections' element={<Connections />} />
                {/* Added: a connection's full profile */}
                <Route path='/connections/:userId' element={<ConnectionProfile />} />
                <Route path='/requests' element={<Requests />} />
                <Route path='/reset-password/:token' element={<ResetPassword />} />
                {/* Added: any unknown URL shows a 404 page instead of a blank page */}
                <Route path='*' element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </MotionConfig>
      </Provider>
    </>
  );
}

export default App;
