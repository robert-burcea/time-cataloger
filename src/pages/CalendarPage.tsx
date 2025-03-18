
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import Navbar from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';

const CalendarPage = () => {
  const { user } = useAuth();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Calendar</h1>
              <p className="text-muted-foreground mb-6">
                View and manage your scheduled tasks
              </p>
              
              <div className="bg-card rounded-lg shadow p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="mx-auto"
                />
                
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Tasks for {date?.toLocaleDateString()}
                  </h2>
                  <p className="text-muted-foreground">
                    Calendar view with tasks will be implemented soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default CalendarPage;
