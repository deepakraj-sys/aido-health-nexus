
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { toast } from "@/components/ui/use-toast";

export default function Telehealth() {
  const [upcomingAppointments] = useState([
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Neurologist",
      date: "2025-05-15",
      time: "10:00 AM",
      status: "confirmed",
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialty: "Cardiologist",
      date: "2025-05-22",
      time: "2:30 PM",
      status: "pending",
    },
  ]);
  
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
      action: () => {
        toast({
          title: "Scheduling Assistant",
          description: "Opening appointment scheduling calendar"
        });
      },
      description: "opening the appointment scheduler",
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
            Connect with healthcare providers through video calls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{appointment.doctorName}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {appointment.status === "confirmed"
                            ? "Confirmed"
                            : "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {appointment.specialty}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm">
                          {new Date(appointment.date).toLocaleDateString()} at{" "}
                          {appointment.time}
                        </p>
                        <Button
                          size="sm"
                          disabled={appointment.status !== "confirmed"}
                        >
                          Join Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  No upcoming appointments
                </p>
              )}

              <Button className="w-full mt-4" variant="outline">
                Schedule New Appointment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect quickly with healthcare providers for urgent consultations
                </p>
                
                <Button className="w-full" variant="outline">
                  Find Available Doctors
                </Button>
                
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

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
