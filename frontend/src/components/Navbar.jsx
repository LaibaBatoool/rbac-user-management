import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

toast.success("Task created!");
toast.error("Error occurred");

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav>
            <Link to="/dashboard">Dashboard</Link>

            {user && <Link to="/projects">Projects</Link>}

            {user?.role === "admin" && (
                <Link to="/users">Users</Link>
            )}

            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }}
            >
                Logout
            </button>
        </nav>
    );
};

export default Navbar;
