
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Video, Users, Clock, MessageCircle, PhoneCall, Calendar as CalendarIcon2, AlertCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentRow, ProfileRow } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

export default function Telehealth() {
  const [appointments, setAppointments] = useState<(AppointmentRow & { doctor: ProfileRow, patient: ProfileRow })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<ProfileRow[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [appointmentDuration, setAppointmentDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  // Fetch appointments when the component mounts
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let query;
        
        if (user.role === UserRole.DOCTOR) {
          // For doctors, get all appointments where they are the doctor
          query = supabase
            .from('appointments')
            .select(`
              *,
              doctor:doctor_id(id, name, email, avatar, role),
              patient:patient_id(id, name, email, avatar, role)
            `)
            .eq('doctor_id', user.id)
            .order('start_time', { ascending: true });
        } else {
          // For patients, get all appointments where they are the patient
          query = supabase
            .from('appointments')
            .select(`
              *,
              doctor:doctor_id(id, name, email, avatar, role),
              patient:patient_id(id, name, email, avatar, role)
            `)
            .eq('patient_id', user.id)
            .order('start_time', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setAppointments(data as any || []);
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error Loading Appointments",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch doctors for scheduling 
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', UserRole.DOCTOR);
          
        if (error) throw error;
        
        setDoctors(data || []);
      } catch (err: any) {
        console.error("Error fetching doctors:", err);
        toast({
          variant: "destructive",
          title: "Error Loading Doctors",
          description: "Failed to load available doctors.",
        });
      }
    };

    fetchAppointments();
    fetchDoctors();
    
    // Set up real-time subscription for appointments
    const appointmentsSubscription = supabase
      .channel('appointments-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: user.role === UserRole.DOCTOR 
            ? `doctor_id=eq.${user.id}` 
            : `patient_id=eq.${user.id}`
        }, 
        (payload) => {
          fetchAppointments();
        }
      )
      .subscribe();
      
    // Clean up
    return () => {
      supabase.removeChannel(appointmentsSubscription);
    };
  }, [isAuthenticated, user]);
  
  // Create an appointment
  const handleScheduleAppointment = async () => {
    if (!user || !selectedDoctor) return;
    
    setIsSubmitting(true);
    
    try {
      // Format the start time using the selected date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on duration
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(appointmentDuration));
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: selectedDoctor,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'scheduled',
          notes: notes.trim() || null
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Appointment Scheduled",
        description: `Your appointment has been scheduled successfully for ${format(startTime, 'PPpp')}`,
      });
      
      // Reset form fields
      setSelectedDoctor(null);
      setSelectedDate(new Date());
      setSelectedTime("10:00");
      setAppointmentDuration("30");
      setNotes("");
      
      setShowScheduleDialog(false);
    } catch (err: any) {
      console.error("Error scheduling appointment:", err);
      toast({
        variant: "destructive",
        title: "Scheduling Failed",
        description: err.message || "Failed to schedule appointment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Cancel an appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled successfully.",
      });
    } catch (err: any) {
      console.error("Error cancelling appointment:", err);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: err.message || "Failed to cancel the appointment.",
      });
    }
  };
  
  // Join a video call
  const handleJoinCall = (appointment: any) => {
    // In a real app, this would connect to a video calling service
    toast({
      title: "Joining Video Call",
      description: `Connecting to your appointment with ${
        user?.role === UserRole.DOCTOR 
          ? appointment.patient?.name 
          : appointment.doctor?.name
      }...`,
    });
    
    // Simulate joining a call
    setTimeout(() => {
      toast({
        title: "Call Connected",
        description: "You are now connected to the video call.",
      });
    }, 2000);
  };
  
  // Get appointment status badge styling
  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'completed':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'cancelled':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'in-progress':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
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
      command: "schedule appointment",
      action: () => setShowScheduleDialog(true),
      description: "opening appointment scheduling dialog",
      category: "telehealth" as const,
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
          <h1 className="text-3xl font-bold">Telehealth</h1>
          <p className="text-muted-foreground mt-1">
            Connect with healthcare providers through video calls and manage your appointments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Upcoming Appointments
                </div>
                {user?.role !== UserRole.DOCTOR && (
                  <Button onClick={() => setShowScheduleDialog(true)}>
                    Schedule New Appointment
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading appointments...</span>
                </div>
              ) : error ? (
                <div className="text-center py-6 text-red-500">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          {user?.role === UserRole.DOCTOR 
                            ? `Appointment with ${appointment.patient?.name}`
                            : `Appointment with ${appointment.doctor?.name}`
                          }
                        </h3>
                        <Badge className={getAppointmentStatusBadge(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon2 className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>
                            {format(new Date(appointment.start_time), 'PPP')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>
                            {format(new Date(appointment.start_time), 'p')} - 
                            {format(new Date(appointment.end_time), 'p')}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex items-center justify-end space-x-2">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleJoinCall(appointment)}
                              disabled={new Date(appointment.start_time) > new Date()}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Join Call
                            </Button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            View Summary
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  {user?.role !== UserRole.DOCTOR && (
                    <Button onClick={() => setShowScheduleDialog(true)}>
                      Schedule Your First Appointment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Quick Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <PhoneCall className="h-4 w-4 mr-2 text-primary" />
                    Urgent Consultation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Need urgent medical advice? Connect with an available healthcare provider now.
                  </p>
                  <Button className="w-full" variant="outline">
                    Find Available Doctors
                  </Button>
                </div>
                
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                    Secure Messaging
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send secure messages to your healthcare providers.
                  </p>
                  <Button className="w-full" variant="outline">
                    Open Messages
                  </Button>
                </div>
                
                <div className="border rounded p-4 mt-4">
                  <h3 className="font-medium mb-2">Telehealth Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Find a quiet, private location for your call</li>
                    <li>Have your health information and questions ready</li>
                    <li>Test your camera and microphone before the appointment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Schedule Appointment Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Doctor</Label>
              <select 
                id="doctor"
                className="w-full border border-input bg-background rounded-md px-3 py-2"
                value={selectedDoctor || ''}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">-- Select a doctor --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Select Time</Label>
                <select 
                  id="time"
                  className="w-full border border-input bg-background rounded-md px-3 py-2"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  {Array.from({ length: 24 }, (_, hour) => {
                    return [
                      `${hour.toString().padStart(2, '0')}:00`,
                      `${hour.toString().padStart(2, '0')}:30`
                    ];
                  })
                    .flat()
                    .map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <select 
                id="duration"
                className="w-full border border-input bg-background rounded-md px-3 py-2"
                value={appointmentDuration}
                onChange={(e) => setAppointmentDuration(e.target.value)}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any notes or specific concerns for this appointment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleScheduleAppointment} 
              disabled={isSubmitting || !selectedDoctor}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
