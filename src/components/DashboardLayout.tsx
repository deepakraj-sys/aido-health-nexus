
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Menu, 
  X, 
  User,
  Heart,
  Activity,
  Brain,
  Wand2,
  Home,
  Settings,
  HelpCircle,
  BarChart3,
  Sparkles,
  Tablet,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

const roleIcons = {
  [UserRole.PATIENT]: Heart,
  [UserRole.DOCTOR]: Activity,
  [UserRole.ENGINEER]: Wand2,
  [UserRole.RESEARCHER]: Brain,
};

const roleColors = {
  [UserRole.PATIENT]: "bg-aido-patient/10 text-aido-patient border-aido-patient/30",
  [UserRole.DOCTOR]: "bg-aido-doctor/10 text-aido-doctor border-aido-doctor/30",
  [UserRole.ENGINEER]: "bg-aido-engineer/10 text-aido-engineer border-aido-engineer/30",
  [UserRole.RESEARCHER]: "bg-aido-researcher/10 text-aido-researcher border-aido-researcher/30",
};

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const RoleIcon = roleIcons[user.role];
  
  // Define menu items based on user role
  const commonMenuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help", href: "/help", icon: HelpCircle },
  ];
  
  const roleSpecificMenuItems: Record<UserRole, MenuItem[]> = {
    [UserRole.PATIENT]: [
      { name: "Health Insights", href: "/health-insights", icon: Sparkles },
      { name: "Virtual Assistant", href: "/virtual-assistant", icon: Cpu },
      { name: "Telehealth", href: "/telehealth", icon: Tablet },
    ],
    [UserRole.DOCTOR]: [
      { name: "Patient Records", href: "/patient-records", icon: Tablet },
      { name: "AI Diagnostics", href: "/ai-diagnostics", icon: Sparkles },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
    [UserRole.ENGINEER]: [
      { name: "Prototypes", href: "/prototypes", icon: Cpu },
      { name: "Testing Tools", href: "/testing-tools", icon: Tablet },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
    [UserRole.RESEARCHER]: [
      { name: "Data Analysis", href: "/data-analysis", icon: BarChart3 },
      { name: "AI Models", href: "/ai-models", icon: Sparkles },
      { name: "Research Library", href: "/research-library", icon: Tablet },
    ],
  };
  
  const menuItems = [...commonMenuItems, ...roleSpecificMenuItems[user.role]];
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "lg:w-64" : "lg:w-20"
        } hidden lg:block transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="h-full flex flex-col">
          <div className={`p-4 ${isSidebarOpen ? "text-center" : ""}`}>
            <div className="flex items-center justify-center">
              <span className={`text-xl font-bold ${isSidebarOpen ? "block" : "hidden"}`}>
                AidoHealth
              </span>
              <span className={`text-xl font-bold ${!isSidebarOpen ? "block" : "hidden"}`}>
                A
              </span>
            </div>
          </div>
          
          <div className="mt-2 mb-6 px-4">
            <div className={`flex ${isSidebarOpen ? "flex-col items-center" : "justify-center"} p-2 rounded-lg ${roleColors[user.role]} border`}>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {isSidebarOpen && (
                <div className="mt-2 text-center">
                  <p className="font-medium text-sm">{user.name}</p>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <RoleIcon className="h-3 w-3" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <nav className="flex-1 px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  window.location.pathname === item.href
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
                <span className={isSidebarOpen ? "block" : "hidden"}>{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`flex items-center ${!isSidebarOpen && "justify-center"} w-full`}
            >
              <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
              <span className={isSidebarOpen ? "block" : "hidden"}>Logout</span>
            </Button>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex justify-center"
            >
              {isSidebarOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path
                    fill="currentColor"
                    d="M9.5 13l-5-5 5-5 1 1-4 4 4 4z"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path
                    fill="currentColor"
                    d="M6.5 13l5-5-5-5-1 1 4 4-4 4z"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden absolute top-4 left-4"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="h-full flex flex-col">
            <div className="p-4 flex items-center justify-between">
              <span className="text-xl font-bold">AidoHealth</span>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </div>
            
            <div className="mt-2 mb-6 px-4">
              <div className={`flex flex-col items-center p-2 rounded-lg ${roleColors[user.role]} border`}>
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="font-medium text-sm">{user.name}</p>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <RoleIcon className="h-3 w-3" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 px-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    window.location.pathname === item.href
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            
            <div className="p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center w-full"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
