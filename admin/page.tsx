"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function AdminDashboard() {
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

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((client) => client.id !== id))
  }

  const handleEditClient = () => {
    if (editingClient) {
      setClients(clients.map((client) => (client.id === editingClient.id ? editingClient : client)))
      setEditingClient(null)
      setIsEditDialogOpen(false)
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
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Client
                      </Button>
                    </DialogTrigger>
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
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setEditingClient(client)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
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
                              onClick={() => handleDeleteClient(client.id)}
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
                      <TableHead>Old Password</TableHead>
                      <TableHead>New Password</TableHead>
                      <TableHead>Changed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>client001</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">temp123</code>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">newpass456</code>
                      </TableCell>
                      <TableCell>2024-01-20</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
