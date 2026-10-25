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
import { Suspense, lazy } from "react";
// Added: loaded on first visit, so the login page and feed stay light
const Messages = lazy(() => import("./Components/Messages"));
const Settings = lazy(() => import("./Components/Settings"));
// Added: public policy / information pages (no login needed), also loaded on first visit
const TermsAndConditions = lazy(() => import("./Components/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./Components/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./Components/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./Components/ShippingPolicy"));
const Contact = lazy(() => import("./Components/Contact"));
const Premium = lazy(() => import("./Components/Premium"));
const Grievance = lazy(() => import("./Components/Grievance"));
const pageFallback = (
  <div className='flex justify-center py-24' aria-label='Loading'>
    <span className='loading loading-spinner loading-lg text-primary'></span>
  </div>
);
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
                {/* Added: real-time chat and settings */}
                <Route path='/messages' element={<Suspense fallback={pageFallback}><Messages /></Suspense>} />
                <Route path='/messages/:userId' element={<Suspense fallback={pageFallback}><Messages /></Suspense>} />
                <Route path='/settings' element={<Suspense fallback={pageFallback}><Settings /></Suspense>} />
                <Route path='/reset-password/:token' element={<ResetPassword />} />
                {/* Added: public policy and information pages */}
                <Route path='/terms-and-conditions' element={<Suspense fallback={pageFallback}><TermsAndConditions /></Suspense>} />
                <Route path='/privacy-policy' element={<Suspense fallback={pageFallback}><PrivacyPolicy /></Suspense>} />
                <Route path='/refund-and-cancellation' element={<Suspense fallback={pageFallback}><RefundPolicy /></Suspense>} />
                <Route path='/shipping-and-delivery' element={<Suspense fallback={pageFallback}><ShippingPolicy /></Suspense>} />
                <Route path='/contact' element={<Suspense fallback={pageFallback}><Contact /></Suspense>} />
                <Route path='/premium' element={<Suspense fallback={pageFallback}><Premium /></Suspense>} />
                <Route path='/grievance' element={<Suspense fallback={pageFallback}><Grievance /></Suspense>} />
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
