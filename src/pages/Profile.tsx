
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Edit } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

export default function Profile() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go back",
      action: () => window.history.back(),
      description: "going back to previous page",
      category: "navigation" as const,
    },
    {
      command: "update profile",
      action: () => toast({ title: "Edit Profile", description: "Profile editing feature coming soon" }),
      description: "starting profile update",
      category: "navigation" as const,
    },
    {
      command: "go to dashboard",
      action: () => window.location.href = "/dashboard",
      description: "navigating to dashboard",
      category: "navigation" as const,
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your personal information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-16 w-16 text-primary" />
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <Edit className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div className="font-medium">{user.name}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Role</div>
                    <div className="font-medium capitalize">{user.role}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Email Address</div>
                    <div className="font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user.email || 'example@aidohealth.com'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Phone Number</div>
                    <div className="font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user.phone || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
