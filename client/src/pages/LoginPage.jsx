import { Outlet } from "react-router-dom";
import Mantenimiento from "../components/Mantenimiento";


const LoginPage = () => {
  return (
    <>
      <div style={{ width: "100%", maxHeight: "100vh" }}>
        <Outlet />
        {/* <Mantenimiento /> */}
      </div>
    </>
  );
};

export default LoginPage;
