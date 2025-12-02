import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Pages
import Login from "./pages/Login.jsx";
import Menu from "./pages/Menu.jsx";
import Experiment from "./pages/Experiment.jsx";
import Pilot from "./pages/Pilot.jsx";
import Practice from "./pages/Practice.jsx";
import Result from "./pages/Result.jsx";
import Submit from "./pages/Submit.jsx";
import Thanks from "./pages/Thanks.jsx";
import Tips from "./pages/Tips.jsx";
import Introduction from "./pages/Introduction.jsx";
import Reminder from "./pages/Reminder.jsx";

/**
 * Scroll to top on route change to avoid keeping previous scroll
 * position when navigating between pages.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      // some browsers may not support "instant"
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}

// App-level router. Do NOT render ReactDOM here.
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Default: land on reminder page before login */}
        <Route path="/" element={<Navigate to="/reminder" replace />} />

        {/* Public pages */}
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/tips" element={<Tips />} />

        {/* Onboarding */}
        <Route path="/login" element={<Login />} />
        <Route path="/intro" element={<Introduction />} />

        {/* Main flow */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/pilot" element={<Pilot />} />
        <Route path="/batch/:id" element={<Experiment />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:id" element={<Navigate to="/practice" replace />} />
        <Route path="/result" element={<Result />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/pilot-thanks" element={<Thanks />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/reminder" replace />} />
      </Routes>
    </BrowserRouter>
  );
}