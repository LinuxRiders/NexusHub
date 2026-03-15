import { Outlet } from "react-router-dom";
import Mantenimiento from "../components/Mantenimiento";
import Login from "../components/Login/Login";

const LoginPage = () => {
  return (
    <>
      <div style={{ width: "100%", maxHeight: "100vh" }}>
        <Outlet />
        {/* <Mantenimiento /> */}
        <Login />
      </div>
    </>
  );
};

export default LoginPage;
