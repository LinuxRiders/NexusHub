import { Route, Routes } from "react-router-dom";
// import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Propiedades from "./pages/Propiedades";
import User from "./pages/User";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      {/* 
        #################################################################
        #                      DEVELOPMENT ROUTES                       #
        ################################################################# 
      */}
      <Route path="/" element={<Home />} />
      <Route path="/nosotros" element={<Nosotros />} />
      <Route path="/propiedades" element={<Propiedades />} />
      <Route path="/user" element={<User />} />
      <Route path="/login" element={<LoginPage />} />
      {/* 
        #################################################################
        #                        PUBLIC ROUTES                          #
        ################################################################# 
      */}
      {/* <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/" element={<LoginPage />}>
          <Route path="login" element={<Login />} />
          <Route path="verify-account" element={<VerifyAccount />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Route> */}

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
      {/* <Route
        path="/perfil"
        element={<ProtectedRoute to="/login" roles={["user"]} />}
      >
        <Route path="" element={<Perfil />}></Route>
      </Route> */}
    </Routes>
  );
}

export default App;
