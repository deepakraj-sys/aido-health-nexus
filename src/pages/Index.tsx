
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Welcome from "./Welcome";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to Welcome page
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return <Welcome />;
};

export default Index;
