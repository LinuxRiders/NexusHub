import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Propiedades from "./pages/Propiedades";
import Perfil from "./pages/Perfil";
import LoginPage from "./pages/LoginPage";
import Login from "./components/Login/Login";
import ProtectedRoute from "./utils/ProtectedRoute";

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
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/propiedades" element={<Propiedades />} />

        <Route path="/" element={<LoginPage />}>
          <Route path="login" element={<Login />} />
          {/* <Route path="verify-account" element={<VerifyAccount />} />
          <Route path="reset-password" element={<ResetPassword />} /> */}
        </Route>
      </Route>

      {/* 
        #################################################################
        #                         ADMIN PANEL                           #
        ################################################################# 
      */}
      {/* <Route
        path="/admin"
        element={<ProtectedRoute to="/login" roles={["dev", "admin"]} />}
      ></Route> */}

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
    </Routes>
  );
}

export default App;
