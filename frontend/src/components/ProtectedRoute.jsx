import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

toast.success("Task created!");
toast.error("Error occurred");

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role.name)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
