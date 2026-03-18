"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface TimeSlot {
  hour: number
  minute: number
}

interface DishTiming {
  servedFrom: TimeSlot
  servedUntil: TimeSlot
}

interface ServeTimeInputProps {
  timings: DishTiming[]
  onChange: (timings: DishTiming[]) => void
}

export default function ServeTimeInput({ timings, onChange }: ServeTimeInputProps) {
  const addTiming = () => {
    onChange([
      ...timings,
      {
        servedFrom: { hour: 9, minute: 0 },
        servedUntil: { hour: 17, minute: 0 }
      }
    ])
  }

  const removeTiming = (index: number) => {
    onChange(timings.filter((_, i) => i !== index))
  }

  const updateTiming = (index: number, field: 'servedFrom' | 'servedUntil', value: string) => {
    const [hour, minute] = value.split(':').map(Number)
    const updated = [...timings]
    updated[index] = {
      ...updated[index],
      [field]: { hour, minute }
    }
    onChange(updated)
  }

  const formatTime = (slot: TimeSlot) => {
    return `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Serve Times</Label>
        <Button type="button" variant="outline" size="sm" onClick={addTiming}>
          <Plus className="h-4 w-4 mr-1" /> Add Time Slot
        </Button>
      </div>

      {timings.length === 0 && (
        <p className="text-sm text-muted-foreground">No serve times added. Click "Add Time Slot" to add one.</p>
      )}

      {timings.map((timing, index) => (
        <div key={index} className="flex items-end gap-2 p-3 border rounded-md">
          <div className="flex-1">
            <Label className="text-xs">From</Label>
            <Input
              type="time"
              value={formatTime(timing.servedFrom)}
              onChange={(e) => updateTiming(index, 'servedFrom', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">Until</Label>
            <Input
              type="time"
              value={formatTime(timing.servedUntil)}
              onChange={(e) => updateTiming(index, 'servedUntil', e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeTiming(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
