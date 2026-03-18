"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReminderDrawer } from '@/components/dishes/ReminderDrawer'
import { cn } from '@/lib/utils'
import DishStatusBadge from './DishStatusBadge'

interface TodaysScheduleProps {
  dish: any
}

export default function TodaysSchedule({ dish }: TodaysScheduleProps) {
  const [isReminderOpen, setIsReminderOpen] = useState(false)
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsReminderOpen(true)}
          className="flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Set Reminder
        </Button>
      </div>
      
      <div className="flex items-center justify-center py-4">
        <DishStatusBadge dishId={dish.id} autoRefresh={true} />
      </div>
      
      <ReminderDrawer
        isOpen={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        dish={{
          id: dish.id,
          name: dish.name,
          status: null,
          timings: dish.timings || []
        }}
        onReminderSet={() => {
          // Reminder set successfully
        }}
      />
    </div>
  );
}