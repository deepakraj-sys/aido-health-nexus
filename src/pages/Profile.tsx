
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Phone, Key, Camera, Check } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UpdateProfile, ProfileRow } from "@/types/supabase";
import { TwilioVerifyPhone } from "@/components/TwilioVerifyPhone";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    avatar: ""
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          username: data.username || "",
          avatar: data.avatar || ""
        });
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [isAuthenticated, user]);
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Update profile information
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      
      const updates: UpdateProfile = {
        name: formData.name,
        username: formData.username || null,
        phone: formData.phone || null,
        avatar: formData.avatar || null,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully"
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Failed to update profile information"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "The new passwords do not match"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password.new
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully"
      });
      
      // Reset password fields
      setPassword({
        current: "",
        new: "",
        confirm: ""
      });
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Failed to update password"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go back",
      action: () => window.history.back(),
      description: "going back to previous page",
      category: "navigation" as const,
    },
    {
      command: "save profile",
      action: () => {
        const form = document.getElementById("profile-form") as HTMLFormElement;
        if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      },
      description: "saving profile information",
      category: "user" as const,
    },
    {
      command: "go to dashboard",
      action: () => window.location.href = "/dashboard",
      description: "navigating to dashboard",
      category: "navigation" as const,
    },
  ];

  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to view your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
            Manage your account information and settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                {formData.avatar ? (
                  <AvatarImage src={formData.avatar} alt={formData.name} />
                ) : (
                  <AvatarFallback>
                    {formData.name
                      ? formData.name.substring(0, 2).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <h3 className="font-medium text-lg">{formData.name}</h3>
              <p className="text-muted-foreground text-sm mb-2">{formData.email}</p>
              {profile?.role && (
                <Badge>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              )}
              
              <div className="mt-4 w-full">
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              </div>
              
              {/* Show verified badge if phone is verified */}
              {profile?.phone_verified && profile.phone && (
                <div className="mt-4 flex items-center">
                  <Check className="text-green-500 h-4 w-4 mr-1" />
                  <span className="text-sm text-green-600">
                    Phone Verified: {profile.phone}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">
                            Contact support to change your email address
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                          />
                        </div>
                        
                        <Button type="submit" disabled={saving}>
                          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="flex items-center">
                          <Key className="h-4 w-4 mr-1" />
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={password.current}
                          onChange={(e) => setPassword({ ...password, current: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={password.new}
                          onChange={(e) => setPassword({ ...password, new: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={password.confirm}
                          onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={saving || !password.current || !password.new || !password.confirm}
                      >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="verification">
                {profile?.phone_verified ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Phone Verified
                      </CardTitle>
                      <CardDescription>
                        Your phone number ({profile.phone}) has been successfully verified.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" onClick={() => {
                        // This would reset the verification status
                        toast({
                          title: "Feature Not Available",
                          description: "Phone number change is not available at this time."
                        });
                      }}>
                        Change Phone Number
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <TwilioVerifyPhone />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
