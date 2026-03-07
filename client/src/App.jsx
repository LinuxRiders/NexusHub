import { Route, Routes } from "react-router-dom";

// --- PAGES & LAYOUTS ---
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";

// --- UTILS & DATA ---
import ProtectedRoute from "./utils/ProtectedRoute.jsx";

import VerifyAccount from "./components/Login/VerifyAccount.jsx";
import ResetPassword from "./components/Login/ResetPassword.jsx";
import Login from "./components/Login/Login.jsx";
// import ViewCursos from "./components/ViewCursos/ViewCursos"; // Unused?

function App() {
  return (
    <Routes>
      {/* 
        #################################################################
        #                      DEVELOPMENT ROUTES                       #
        ################################################################# 
      */}

      {/* 
        #################################################################
        #                        PUBLIC ROUTES                          #
        ################################################################# 
      */}
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route path="/" element={<LoginPage />}>
          <Route path="login" element={<Login />} />
          <Route path="verify-account" element={<VerifyAccount />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      {/* 
        #################################################################
        #                         ADMIN PANEL                           #
        ################################################################# 
      */}
      <Route
        path="/admin"
        element={<ProtectedRoute to="/login" roles={["dev", "admin"]} />}
      ></Route>

      {/* 
        #################################################################
        #                         USER PROFILE                          #
        ################################################################# 
      */}
      <Route
        path="/perfil"
        element={<ProtectedRoute to="/login" roles={["user"]} />}
      >
        <Route path="" element={<Perfil />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
