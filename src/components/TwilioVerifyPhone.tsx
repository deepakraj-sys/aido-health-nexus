
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, CheckCircle } from "lucide-react";
import { twilioService } from "@/services/twilioService";
import { useAuth } from "@/contexts/AuthContext";

interface TwilioVerifyPhoneProps {
  onVerificationComplete?: () => void;
}

export function TwilioVerifyPhone({ onVerificationComplete }: TwilioVerifyPhoneProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  
  const handleSendVerification = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    const response = await twilioService.sendVerificationCode(phoneNumber);
    setLoading(false);
    
    if (response.success) {
      setVerificationSent(true);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!phoneNumber || !verificationCode) return;
    
    setLoading(true);
    const response = await twilioService.verifyCode(phoneNumber, verificationCode);
    setLoading(false);
    
    if (response.success && response.isVerified) {
      setVerified(true);
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    }
  };
  
  if (verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Phone Verified
          </CardTitle>
          <CardDescription>
            Your phone number has been successfully verified.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Verify Phone Number
        </CardTitle>
        <CardDescription>
          We'll send a verification code to your phone to confirm your identity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!verificationSent ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+15551234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your phone number with country code (e.g., +1 for US).
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!verificationSent ? (
          <Button onClick={handleSendVerification} disabled={!phoneNumber || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Verification Code
          </Button>
        ) : (
          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => setVerificationSent(false)}
              disabled={loading}
            >
              Change Number
            </Button>
            <Button 
              onClick={handleVerifyCode} 
              disabled={!verificationCode || loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
