"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TableCell } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Edit, LogOut, Users, Key } from "lucide-react"

interface Client {
  id: string
  username: string
  password: string
  createdAt: string
  lastLogin?: string
  passwordChanged?: boolean
}

// Mock functions - replace with actual service calls
const updateClient = async (id: string, data: Partial<Client>) => {
  // This would be your actual API call
  return Promise.resolve()
}

const loadClients = async () => {
  // This would be your actual API call to reload clients
  return Promise.resolve()
}

const AdminPage = () => {
  // Add authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "admin") {
      window.location.href = "/"
      return
    }
  }, [])

  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      username: "client001",
      password: "temp123",
      createdAt: "2024-01-15",
      lastLogin: "2024-01-20",
      passwordChanged: true,
    },
    {
      id: "2",
      username: "client002",
      password: "temp456",
      createdAt: "2024-01-16",
      lastLogin: "2024-01-19",
      passwordChanged: false,
    },
  ])

  const [newClient, setNewClient] = useState({ username: "", password: "" })
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false)
  const [passwordChangeClient, setPasswordChangeClient] = useState<Client | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleAddClient = () => {
    if (newClient.username && newClient.password) {
      const client: Client = {
        id: Date.now().toString(),
        username: newClient.username,
        password: newClient.password,
        createdAt: new Date().toISOString().split("T")[0],
        passwordChanged: false,
      }
      setClients([...clients, client])
      setNewClient({ username: "", password: "" })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteClient = async (id: string, username: string) => {
    if (confirm(`Are you sure you want to delete client ${username}?`)) {
      setClients(clients.filter((client) => client.id !== id))
      setSuccess(`Client ${username} deleted successfully`)
    }
  }

  const handleEditClient = () => {
    if (editingClient) {
      setClients(clients.map((client) => (client.id === editingClient.id ? editingClient : client)))
      setEditingClient(null)
      setIsEditDialogOpen(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordChangeClient) return

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      setError("")
      setSuccess("")

      await updateClient(passwordChangeClient.id, {
        password: newPassword,
        passwordChanged: true,
      })

      // Update local state
      setClients(clients.map(client => 
        client.id === passwordChangeClient.id 
          ? { ...client, password: newPassword, passwordChanged: true }
          : client
      ))

      setSuccess(`Password updated successfully for ${passwordChangeClient.username}`)
      setIsPasswordChangeOpen(false)
      setPasswordChangeClient(null)
      setNewPassword("")
      setConfirmPassword("")
      await loadClients()
    } catch (error: any) {
      console.error("Error updating password:", error)
      setError(`Failed to update password: ${error.message}`)
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("username")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clients">Client Management</TabsTrigger>
            <TabsTrigger value="passwords">Password Changes</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Client Management</CardTitle>
                    <CardDescription>Manage client accounts, passwords, and access</CardDescription>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Client
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>Create a new client account with username and password</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Client Username</Label>
                          <Input
                            id="username"
                            value={newClient.username}
                            onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
                            placeholder="Enter client username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="flex gap-2">
                            <Input
                              id="password"
                              value={newClient.password}
                              onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                              placeholder="Enter password"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setNewClient({ ...newClient, password: generatePassword() })}
                            >
                              Generate
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddClient}>Add Client</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.username}</TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{client.password}</code>
                        </TableCell>
                        <TableCell>{client.createdAt}</TableCell>
                        <TableCell>{client.lastLogin || "Never"}</TableCell>
                        <TableCell>
                          {client.passwordChanged ? (
                            <Badge variant="secondary">Password Changed</Badge>
                          ) : (
                            <Badge variant="outline">Default Password</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPasswordChangeClient(client)
                                setIsPasswordChangeOpen(true)
                              }}
                              title="Change Password"
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                              <Button variant="outline" size="sm" onClick={() => {
                                setEditingClient(client)
                                setIsEditDialogOpen(true)
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Client</DialogTitle>
                                  <DialogDescription>Update client username and password</DialogDescription>
                                </DialogHeader>
                                {editingClient && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-username">Username</Label>
                                      <Input
                                        id="edit-username"
                                        value={editingClient.username}
                                        onChange={(e) =>
                                          setEditingClient({
                                            ...editingClient,
                                            username: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-password">Password</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          id="edit-password"
                                          value={editingClient.password}
                                          onChange={(e) =>
                                            setEditingClient({
                                              ...editingClient,
                                              password: e.target.value,
                                            })
                                          }
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() =>
                                            setEditingClient({
                                              ...editingClient,
                                              password: generatePassword(),
                                            })
                                          }
                                        >
                                          Generate
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleEditClient}>Update Client</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClient(client.id, client.username)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passwords">
            <Card>
              <CardHeader>
                <CardTitle>Password Change History</CardTitle>
                <CardDescription>Track when clients change their passwords</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Changed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.username}</TableCell>
                        <TableCell>
                          {client.passwordChanged ? (
                            <Badge variant="secondary">Changed</Badge>
                          ) : (
                            <Badge variant="outline">Default</Badge>
                          )}
                        </TableCell>
                        <TableCell>{client.passwordChanged ? client.lastLogin || "Unknown" : "Never"}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setPasswordChangeClient(client)
                              setIsPasswordChangeOpen(true)
                            }}
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Reset Password
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Change password for client: {passwordChangeClient?.username}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordChangeOpen(false)
                  setPasswordChangeClient(null)
                  setNewPassword("")
                  setConfirmPassword("")
                  setError("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Change Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPage
