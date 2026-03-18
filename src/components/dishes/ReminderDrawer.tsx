"use client"

import { useState } from "react"
import { Bell, Clock, Calendar, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface ReminderDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dish: {
    id: string
    name: string
    status: string | null
    timings?: {
      preparedAt: { hour: number; minute: number }
      servedFrom: { hour: number; minute: number }
      servedUntil: { hour: number; minute: number }
    }[]
  }
  onReminderSet: () => void
}

export function ReminderDrawer({ isOpen, onOpenChange, dish, onReminderSet }: ReminderDrawerProps) {
  const [step, setStep] = useState(1)
  const [remindBefore, setRemindBefore] = useState("30")
  const [customTime, setCustomTime] = useState("")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const isServingNow = dish.status === "Serving Now"
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  
  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ]

  const handleTimeSelection = (value: string) => {
    setRemindBefore(value)
    if (value !== "custom") {
      setCustomTime("")
    }
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays(current => 
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    )
  }

  const handleNext = () => {
    if (step === 1) {
      if (remindBefore === "custom") {
        if (!customTime) {
          toast.error("Please enter a custom time", {
            description: "Enter how many minutes before you want to be reminded"
          })
          return
        }
        const minutes = parseInt(customTime)
        if (isNaN(minutes) || minutes < 1 || minutes > 360) {
          toast.error("Invalid time", {
            description: "Please enter a value between 1 and 360 minutes (6 hours)"
          })
          return
        }
      }
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    if (selectedDays.length === 0 && !isServingNow) {
      toast.error("Please select at least one day", {
        description: "Select which days you want to be reminded"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const reminderMinutes = remindBefore === "custom" 
        ? parseInt(customTime) 
        : parseInt(remindBefore)
      
      const isRecurring = selectedDays.length > 0
      
      // Calculate reminder time for today if serving now
      let reminderTime = null
      if (isServingNow && dish.timings && dish.timings.length > 0) {
        const now = new Date()
        const currentTiming = dish.timings[0]
        
        // Set reminder for today's serving time
        reminderTime = new Date()
        reminderTime.setHours(currentTiming.servedFrom.hour)
        reminderTime.setMinutes(currentTiming.servedFrom.minute - reminderMinutes)
      }
      
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishId: dish.id,
          reminderTime,
          isRecurring,
          recurringDays: selectedDays,
          remindBefore: reminderMinutes
        }),
      })

      if (response.ok) {
        toast.success("Reminder set successfully", {
          description: `You'll be reminded about ${dish.name}`
        })
        
        // Dispatch custom event to refresh notifications
        window.dispatchEvent(new CustomEvent('reminderSet'))
        
        onReminderSet()
        onOpenChange(false)
        setStep(1)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set reminder')
      }
    } catch (error) {
      console.error('Error setting reminder:', error)
      toast.error("Failed to set reminder", {
        description: "Please try again later"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setStep(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {step === 1 ? "Set Reminder Time" : "Select Days"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 
              ? `How much time before would you like to be reminded about ${dish.name}?` 
              : `Select which days you want to be reminded about ${dish.name}`}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="px-4 py-2">
            <RadioGroup 
              value={remindBefore} 
              onValueChange={handleTimeSelection}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="r1" />
                <Label htmlFor="r1" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  15 minutes before
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="r2" />
                <Label htmlFor="r2" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  30 minutes before
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="60" id="r3" />
                <Label htmlFor="r3" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  1 hour before
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="r4" />
                <Label htmlFor="r4" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Custom time
                </Label>
              </div>
              
              {remindBefore === "custom" && (
                <div className="pl-6 mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Minutes"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-24"
                      min="1"
                      max="360"
                    />
                    <span className="text-sm text-muted-foreground">minutes before</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">
                    Enter 1-360 minutes (up to 6 hours)
                  </p>
                </div>
              )}
            </RadioGroup>
          </div>
        ) : (
          <div className="px-4 py-2">
            {isServingNow && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  This dish is currently being served. You can only set reminders for future days.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={day.id} 
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                    disabled={isServingNow && day.id === today}
                  />
                  <Label 
                    htmlFor={day.id}
                    className={`flex items-center ${isServingNow && day.id === today ? 'text-muted-foreground' : ''}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {day.label} {isServingNow && day.id === today && "(Today)"}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={handleNext} className="flex-1">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? "Setting reminder..." : "Set Reminder"} 
              {!isLoading && <Check className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}