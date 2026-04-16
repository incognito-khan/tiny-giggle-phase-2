import { jwtDecode } from "jwt-decode";
import { logout } from "./authSlice";

export const checkTokenExpiry = () => (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // in seconds

      if (decoded.exp < currentTime) {
        dispatch(logout({ router: { push: () => {} } }));
      }
    } catch (error) {
      console.error("Invalid token:", error);
      dispatch(logout({ router: { push: () => {} } }));
    }
  }
};