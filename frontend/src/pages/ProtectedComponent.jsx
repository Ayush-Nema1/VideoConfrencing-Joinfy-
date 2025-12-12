import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { userData } = useContext(AuthContext);

    if (userData.token === undefined) return null;

    if (!userData.token) return <Navigate to="/auth" replace />;

    return children;
}
