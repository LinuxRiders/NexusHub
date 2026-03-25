import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Propiedades from "./pages/Propiedades";
import Perfil from "./pages/Perfil";
import LoginPage from "./pages/LoginPage";
import Login from "./components/Login/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import VerifyAccount from "./components/Login/VerifyAccount";
import ResetPassword from "./components/Login/ResetPassword";
import ResetEmail from "./components/Login/ResetEmail";

import Legalidades from "./pages/Legalidades";

import Admin from "./pages/Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 
        #################################################################
        #                      DEVELOPMENT ROUTES                       #
        ################################################################# 
      */}
        <Route path="/legalidades" element={<Legalidades />} />
        {/* 
        #################################################################
        #                        PUBLIC ROUTES                          #
        ################################################################# 
      */}
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/propiedades" element={<Propiedades />} />

        <Route path="/" element={<LoginPage />}>
          <Route path="login" element={<Login />} />
          <Route path="verify-account" element={<VerifyAccount />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="reset-mail" element={<ResetEmail />} />
        </Route>

        {/* 
        #################################################################
        #                         ADMIN PANEL                           #
        ################################################################# 
        */}
        <Route
          path="/admin"
          element={<ProtectedRoute to="/login" roles={["dev", "admin"]} />}
        >
          <Route path="" element={<Admin />} />
        </Route>

        {/* 
        #################################################################
        #                         USER PROFILE                          #
        ################################################################# 
        */}
        <Route
          path="/perfil"
          element={<ProtectedRoute to="/login" roles={["user"]} />}
        >
          <Route path="" element={<Perfil />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
