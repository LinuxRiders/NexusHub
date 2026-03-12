import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";

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

        {/* <Route path="/" element={<LoginPage />}>
          <Route path="login" element={<Login />} />
          <Route path="verify-account" element={<VerifyAccount />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route> */}
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
