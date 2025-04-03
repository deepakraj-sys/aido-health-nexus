
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface TwilioVerificationResponse {
  success: boolean;
  message: string;
  verificationSid?: string;
}

export interface TwilioVerifyCheckResponse {
  success: boolean;
  message: string;
  isVerified?: boolean;
}

export const twilioService = {
  /**
   * Starts the phone verification process
   */
  async sendVerificationCode(phoneNumber: string): Promise<TwilioVerificationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('twilio-verify-send', {
        body: { phoneNumber }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Verification code sent',
        description: `A verification code has been sent to ${phoneNumber}`
      });
      
      return {
        success: true,
        message: 'Verification code sent successfully',
        verificationSid: data.verificationSid
      };
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      
      toast({
        variant: 'destructive',
        title: 'Failed to send verification code',
        description: error.message || 'Something went wrong'
      });
      
      return {
        success: false,
        message: error.message || 'Failed to send verification code'
      };
    }
  },
  
  /**
   * Checks the verification code against the one sent
   */
  async verifyCode(phoneNumber: string, code: string): Promise<TwilioVerifyCheckResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('twilio-verify-check', {
        body: { phoneNumber, code }
      });
      
      if (error) throw error;
      
      if (data.valid) {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          throw new Error('No authenticated user found');
        }
        
        // Update the user's profile to mark the phone as verified
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            phone_verified: true 
          })
          .eq('id', session.user.id);
        
        if (updateError) throw updateError;
        
        toast({
          title: 'Phone verified',
          description: 'Your phone number has been verified successfully'
        });
        
        return {
          success: true,
          message: 'Phone number verified successfully',
          isVerified: true
        };
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid code',
          description: 'The verification code is invalid or has expired'
        });
        
        return {
          success: false,
          message: 'Invalid verification code',
          isVerified: false
        };
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      
      toast({
        variant: 'destructive',
        title: 'Failed to verify code',
        description: error.message || 'Something went wrong'
      });
      
      return {
        success: false,
        message: error.message || 'Failed to verify code',
        isVerified: false
      };
    }
  }
};
