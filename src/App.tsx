
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EarlyDetection from "./pages/EarlyDetection";
import Bioinformatics from "./pages/Bioinformatics";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HealthAssistant from "./pages/HealthAssistant";
import Telehealth from "./pages/Telehealth";
import SymptomChecker from "./pages/SymptomChecker";
import VirtualAssistant from "./pages/VirtualAssistant";
import PatientRecords from "./pages/PatientRecords";
import AIDiagnosis from "./pages/AIDiagnosis";
import ClinicalResources from "./pages/ClinicalResources";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/early-detection" element={<EarlyDetection />} />
            <Route path="/bioinformatics" element={<Bioinformatics />} />
            <Route path="/health-assistant" element={<HealthAssistant />} />
            <Route path="/telehealth" element={<Telehealth />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/virtual-assistant" element={<VirtualAssistant />} />
            <Route path="/health-insights" element={<HealthAssistant />} />
            <Route path="/patient-records" element={<PatientRecords />} />
            <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
            <Route path="/clinical-resources" element={<ClinicalResources />} />
            <Route path="/help" element={<Help />} />
            <Route path="/patient-analytics" element={<PatientRecords />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
