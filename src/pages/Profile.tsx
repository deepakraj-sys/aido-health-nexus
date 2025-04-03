import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ProfileRow } from "@/types/supabase";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!user) {
          setError("User not found");
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
        setName(data.name || "");
        setUsername(data.username || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setIsPhoneVerified(data.phone_verified || false);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(profile?.name || "");
    setUsername(profile?.username || "");
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
  };
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (!user) {
        setError("User not found");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          username,
          email,
          phone
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile({ ...profile, name, username, email, phone } as ProfileRow);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully"
      });
    } catch (err: any) {
      console.error("Error signing out:", err);
      setSignOutError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out"
      });
    } finally {
      setIsSigningOut(false);
    }
  };
  
  const handleSendVerificationCode = async () => {
    setPhoneVerificationSent(true);
    // In a real application, this would trigger sending a verification code to the user's phone
    toast({
      title: "Verification Code Sent",
      description: "A verification code has been sent to your phone"
    });
  };
  
  const handleVerifyCode = async () => {
    setIsVerifying(true);
    setVerificationError(null);
    try {
      // In a real application, this would verify the code against the one sent to the user's phone
      if (verificationCode === "123456") {
        setIsPhoneVerified(true);
        toast({
          title: "Phone Verified",
          description: "Your phone number has been verified successfully"
        });
      } else {
        setVerificationError("Invalid verification code");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid verification code"
        });
      }
    } catch (err: any) {
      console.error("Error verifying code:", err);
      setVerificationError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify code"
      });
    } finally {
      setIsVerifying(false);
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
      command: "sign out",
      action: handleSignOut,
      description: "signing out of your account",
      category: "authentication" as const, // Changed from "user" to "authentication"
    },
    {
      command: "save profile",
      action: handleSaveProfile,
      description: "saving profile changes",
      category: "settings" as const, // Changed from "user" to "settings"
    }
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
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and profile information
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading profile...</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing || phoneVerificationSent}
                  />
                </div>

                {!isPhoneVerified ? (
                  <>
                    {!phoneVerificationSent ? (
                      <Button
                        variant="secondary"
                        onClick={handleSendVerificationCode}
                        disabled={!isEditing || phoneVerificationSent}
                      >
                        Send Verification Code
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="verificationCode">Verification Code</Label>
                        <Input
                          id="verificationCode"
                          placeholder="Enter verification code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          disabled={isVerifying}
                        />
                        <Button
                          onClick={handleVerifyCode}
                          disabled={isVerifying}
                        >
                          {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Verify Code
                        </Button>
                        {verificationError && (
                          <p className="text-sm text-destructive mt-1">{verificationError}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">Phone number verified</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {!isEditing ? (
                    <Button onClick={handleEditProfile}>Edit Profile</Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Out
            </Button>
            {signOutError && (
              <p className="text-sm text-destructive mt-2">{signOutError}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
