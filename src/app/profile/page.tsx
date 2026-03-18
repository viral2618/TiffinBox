"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchNotificationPreferences, updateNotificationPreference } from "@/redux/features/notificationPreferencesSlice"
import FeedbackButton from "@/components/feedback/FeedbackButton"
import {
  User,
  Lock,
  Bell,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Shield,
  UserCircle,
  Settings,
  BellRing,
  ExternalLink,
  Sparkles,
  Info
} from "lucide-react"

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")

  // Personal info state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

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
  
  // Fetch notification preferences on component mount
  useEffect(() => {
    dispatch(fetchNotificationPreferences('user'))
  }, [dispatch])

  // Initialize personal info from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
    }
  }, [session])

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Name is required")
      return
    }

    setIsUpdatingProfile(true)

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success("Profile updated successfully")
      
      // Force session refresh and page reload
      await updateSession()
      router.refresh()
      
      // Small delay then reload to ensure session is updated
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Failed to update profile", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsUpdatingProfile(false)
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
      const response = await fetch('/api/user/change-password', {
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: '#fef7ed', color: '#451a03' }}>
      <div className="container mx-auto px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <UserCircle className="absolute top-20 -left-10 h-24 w-24 text-primary/5 transform rotate-12 -z-10" />
        <Shield className="absolute top-1/2 -right-12 h-32 w-32 text-primary/5 transform -rotate-12 -z-10" />
        <Settings className="absolute bottom-10 left-1/4 h-20 w-20 text-primary/5 transform rotate-45 -z-10" />
        <BellRing className="absolute bottom-20 right-1/4 h-28 w-28 text-primary/5 transform -rotate-45 -z-10" />

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <h1 className="text-4xl font-semibold mb-3">
            Your Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Sidebar */}
          <motion.div
            variants={itemVariants}
            className="lg:w-1/4"
          >
            <Card className="sticky top-24 shadow-sm profile" style={{ backgroundColor: '#fef3e2', color: '#451a03', border: '1px solid rgba(69, 26, 3, 0.1)' }}>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto border-4 border-primary/10">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                  <AvatarFallback className="text-2xl bg-primary/10">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 text-2xl">{session?.user?.name || "User"}</CardTitle>
                <CardDescription className="text-sm">{session?.user?.email || "user@example.com"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">{session?.user?.email || "user@example.com"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {/* Beta Version Info */}
                <div className="w-full p-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Beta Version</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    At ZA Charity Feed Foundation, we combine innovation with purpose. Our mission goes beyond charity. We build technology that helps communities and organizations 
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs h-8"
                      onClick={() => window.open('https://zeeshanali.org/', '_blank')}
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Visit Org
                    </Button>
                    <FeedbackButton 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs h-8"
                    />
                  </div>
                </div>
                
                <Button variant="outline" className="w-full group hover:bg-destructive hover:text-destructive-foreground" onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                  <LogOut className="mr-2 h-4 w-4 group-hover:text-destructive-foreground" />
                  Logout
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={itemVariants}
            className="lg:w-3/4"
          >
            <Card className="shadow-sm profile" style={{ backgroundColor: '#fef3e2', color: '#451a03', border: '1px solid rgba(69, 26, 3, 0.1)' }}>
              <CardHeader className="pb-0">
                <h2 className="text-2xl font-semibold mb-2">Account Settings</h2>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8" style={{ backgroundColor: '#f3e8d3' }}>
                    <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" style={{ color: '#451a03' }}>
                      <User className="mr-2 h-4 w-4" />
                      Personal Info
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" style={{ color: '#451a03' }}>
                      <Lock className="mr-2 h-4 w-4" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" style={{ color: '#451a03' }}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Info Tab */}
                  <TabsContent value="personal" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-medium mb-4">Personal Information</h3>
                        <p className="text-muted-foreground mb-6">
                          Update your personal details and contact information.
                        </p>
                      </div>

                      <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(243, 232, 211, 0.5)' }}>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                            <Input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="bg-background/50"
                              style={{ backgroundColor: '#fef3e2', color: '#451a03', border: '1px solid rgba(69, 26, 3, 0.2)' }}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              className="bg-background/50"
                              style={{ backgroundColor: '#fef3e2', color: '#451a03', border: '1px solid rgba(69, 26, 3, 0.2)' }}
                              disabled
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed for security reasons</p>
                          </div>
                          <Button 
                            type="submit" 
                            className="mt-2" 
                            disabled={isUpdatingProfile}
                          >
                            {isUpdatingProfile ? "Updating..." : "Update Profile"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-medium mb-4">Security Settings</h3>
                        <p className="text-muted-foreground mb-6">
                          Manage your password and account security preferences.
                        </p>
                      </div>

                      <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(243, 232, 211, 0.5)' }}>
                        <h4 className="text-lg font-medium mb-4" style={{ color: '#451a03' }}>Change Password</h4>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                              <Link 
                                href="/auth/forgot-password" 
                                className="text-sm text-primary hover:underline"
                                style={{ color: '#fc7c7c' }}
                              >
                                Forgot Password?
                              </Link>
                            </div>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="bg-background/50"
                              style={{ backgroundColor: '#fef3e2', color: '#451a03', border: '1px solid rgba(69, 26, 3, 0.2)' }}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-background/50"
                              style={{ backgroundColor: '#fef3e2', color: '#451a03', border: '1px solid rgba(69, 26, 3, 0.2)' }}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="bg-background/50"
                              style={{ backgroundColor: '#fef3e2', color: '#451a03', border: '1px solid rgba(69, 26, 3, 0.2)' }}
                              required
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="mt-2" 
                            disabled={isChangingPassword}
                          >
                            {isChangingPassword ? "Changing..." : "Change Password"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Notification Preferences Tab */}
                  <TabsContent value="notifications" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-medium mb-4">Notification Preferences</h3>
                        <p className="text-muted-foreground mb-6">
                          Manage how you receive notifications and updates from us.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {loadingPreferences ? (
                          <div className="p-6 rounded-lg flex justify-center items-center h-40" style={{ backgroundColor: 'rgba(243, 232, 211, 0.5)' }}>
                            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="p-6 rounded-lg space-y-4" style={{ backgroundColor: 'rgba(243, 232, 211, 0.5)' }}>
                            <h4 className="text-lg font-medium" style={{ color: '#451a03' }}>Notification Settings</h4>

                            <div className="flex items-center justify-between py-3 border-b">
                              <div>
                                <p className="font-medium">General Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive general updates about the platform</p>
                              </div>
                              <Switch 
                                checked={preferences?.general || false} 
                                onCheckedChange={(checked) => {
                                  dispatch(updateNotificationPreference({ 
                                    preferences: { general: checked },
                                    userType: 'user'
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
                                checked={preferences?.emailAlerts || false} 
                                onCheckedChange={(checked) => {
                                  dispatch(updateNotificationPreference({ 
                                    preferences: { emailAlerts: checked },
                                    userType: 'user'
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
                                checked={preferences?.notificationAlert || false} 
                                onCheckedChange={(checked) => {
                                  dispatch(updateNotificationPreference({ 
                                    preferences: { notificationAlert: checked },
                                    userType: 'user'
                                  }))
                                }}
                                disabled={loadingPreferences}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {preferencesError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {preferencesError}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      

    </div>
  )
}