"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchNotificationPreferences, updateNotificationPreference } from "@/redux/features/notificationPreferencesSlice"
import { Store, Utensils, Bell, Lock, User } from "lucide-react"

interface OwnerStats {
  totalShops: number;
  totalDishes: number;
  name: string;
  email: string;
  phone?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<OwnerStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [phone, setPhone] = useState("")
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Notification preferences from Redux
  const dispatch = useAppDispatch()
  const { preferences, loading: loadingPreferences, error: preferencesError } = useAppSelector(
    (state) => state.notificationPreferences
  )
  
  // Fetch owner stats
  useEffect(() => {
    async function fetchOwnerStats() {
      try {
        const response = await fetch('/api/owner/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch owner stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching owner stats:', error)
        toast.error('Failed to load account information')
      } finally {
        setLoadingStats(false)
      }
    }

    fetchOwnerStats()
  }, [])

  // Update phone state when stats are loaded
  useEffect(() => {
    if (stats?.phone) {
      setPhone(stats.phone)
    }
  }, [stats])

  // Phone validation function
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('91') && digits.length > 10) {
      setPhone(value)
    } else if (digits.length <= 10) {
      setPhone(digits)
    }
  }

  // Fetch notification preferences
  useEffect(() => {
    dispatch(fetchNotificationPreferences('owner'))
  }, [dispatch])
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const name = formData.get('name') as string
      
      const response = await fetch('/api/owner/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      const updatedOwner = await response.json()
      setStats(prev => ({ ...prev, ...updatedOwner }))
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/owner/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Failed to change password", error)
      toast.error(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Show toast on preference update success/error
  const prevLoadingRef = useState(loadingPreferences)[0]
  
  useEffect(() => {
    // If loading changed from true to false and there's no error, show success toast
    if (prevLoadingRef && !loadingPreferences && !preferencesError) {
      toast.success("Notification preferences updated successfully")
    } else if (prevLoadingRef && !loadingPreferences && preferencesError) {
      toast.error("Failed to update notification preferences")
    }
  }, [loadingPreferences, preferencesError, prevLoadingRef])
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      {/* Account Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Store className="h-8 w-8 text-foreground mr-2" />
            <div className="text-2xl font-bold">{stats?.totalShops || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Dishes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Utensils className="h-8 w-8 text-foreground mr-2" />
            <div className="text-2xl font-bold">{stats?.totalDishes || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
            </div>
            <div className="text-lg font-medium">Active</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={stats?.name || "Owner"} />
                  <AvatarFallback className="text-xl bg-primary/10">
                    {stats?.name?.charAt(0) || "O"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{stats?.name || "Owner"}</CardTitle>
                  <CardDescription>{stats?.email || "owner@example.com"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" defaultValue={stats?.name || ""} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={stats?.email || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={15}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </CardContent> 
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={loading} className="bg-secondary text-foreground hover:bg-secondary/80">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPreferences ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">General Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive general updates about the platform</p>
                    </div>
                    <Switch 
                      checked={preferences.general} 
                      onCheckedChange={(checked) => {
                        dispatch(updateNotificationPreference({ 
                          preferences: { general: checked },
                          userType: 'owner'
                        }))
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Email Alerts</p>
                      <p className="text-sm text-muted-foreground">Receive login alerts via email</p>
                    </div>
                    <Switch 
                      checked={preferences.emailAlerts} 
                      onCheckedChange={(checked) => {
                        dispatch(updateNotificationPreference({ 
                          preferences: { emailAlerts: checked },
                          userType: 'owner'
                        }))
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                    </div>
                    <Switch 
                      checked={preferences.notificationAlert} 
                      onCheckedChange={(checked) => {
                        dispatch(updateNotificationPreference({ 
                          preferences: { notificationAlert: checked },
                          userType: 'owner'
                        }))
                      }}
                      disabled={loadingPreferences}
                    />
                  </div>
                </div>
              )}
              
              {preferencesError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {preferencesError}
                </div>
              )}
            </CardContent>

          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="mt-2 bg-secondary text-foreground hover:bg-secondary/80" 
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}