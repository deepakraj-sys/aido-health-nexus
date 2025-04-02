
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8">
          Oops! Page not found
        </p>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button 
          onClick={() => navigate(-1)} 
          size="lg"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <div className="mt-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
