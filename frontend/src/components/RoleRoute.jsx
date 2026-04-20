import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

toast.success("Task created!");
toast.error("Error occurred");

const RoleRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <p>Loading...</p>;

    if (!user) return <Navigate to="/login" />;

    return allowedRoles.includes(user.role)
        ? children
        : <Navigate to="/dashboard" />;
};

export default RoleRoute;
