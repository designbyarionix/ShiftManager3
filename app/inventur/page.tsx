"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, Plus, Search, Edit, Trash2, Save, X } from "lucide-react"
import Link from 'next/link'

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minStock: number
  location: string
  lastUpdated: string
  notes?: string
}

const categories = [
  'Elektronik',
  'Bürobedarf',
  'Verbrauchsmaterial',
  'Werkzeuge',
  'Kleidung',
  'Lebensmittel',
  'Sonstiges'
]

const units = [
  'Stück',
  'kg',
  'Liter',
  'Meter',
  'Packung',
  'Karton'
]

export default function Inventur() {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Laptop',
      category: 'Elektronik',
      quantity: 5,
      unit: 'Stück',
      minStock: 2,
      location: 'Lager A',
      lastUpdated: '2025-01-15',
      notes: 'Dell Latitude 5520'
    },
    {
      id: '2',
      name: 'Druckerpapier',
      category: 'Bürobedarf',
      quantity: 50,
      unit: 'Packung',
      minStock: 10,
      location: 'Lager B',
      lastUpdated: '2025-01-10',
      notes: 'A4, 80g/m²'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minStock: 0,
    location: '',
    notes: ''
  })

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addItem = () => {
    if (!newItem.name || !newItem.category || !newItem.unit || !newItem.location) return
    
    const item: InventoryItem = {
      id: Date.now().toString(),
      ...newItem,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    
    setItems([...items, item])
    setNewItem({
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      minStock: 0,
      location: '',
      notes: ''
    })
    setIsAddItemOpen(false)
  }

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item)
  }

  const saveEdit = () => {
    if (!editingItem) return
    
    updateItem(editingItem.id, editingItem)
    setEditingItem(null)
  }

  const cancelEdit = () => {
    setEditingItem(null)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minStock) return 'bg-red-100 text-red-800'
    if (item.quantity <= item.minStock * 1.5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Zurück zum Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Inventur</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsAddItemOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Artikel
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Artikel oder Standort suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Kategorien</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                {filteredItems.length} von {items.length} Artikeln
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <div className="flex space-x-2">
                    {editingItem?.id === item.id ? (
                      <>
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{item.category}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(item)}`}>
                    {item.quantity <= item.minStock ? 'Niedrig' : item.quantity <= item.minStock * 1.5 ? 'Mittel' : 'Gut'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingItem?.id === item.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({...editingItem, quantity: Number(e.target.value)})}
                        type="number"
                        placeholder="Menge"
                      />
                      <Select value={editingItem.unit} onValueChange={(value) => setEditingItem({...editingItem, unit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      value={editingItem.location}
                      onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                      placeholder="Standort"
                    />
                    <Input
                      value={editingItem.notes || ''}
                      onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                      placeholder="Notizen"
                    />
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{item.quantity}</span>
                      <span className="text-gray-500">{item.unit}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mindestbestand:</span>
                        <span>{item.minStock} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Standort:</span>
                        <span>{item.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aktualisiert:</span>
                        <span>{item.lastUpdated}</span>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {item.notes}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Item Dialog */}
        {isAddItemOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Neuen Artikel hinzufügen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Artikelname"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
                <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Menge"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                  <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Einheit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  placeholder="Mindestbestand"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: Number(e.target.value)})}
                />
                <Input
                  placeholder="Standort"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                />
                <Input
                  placeholder="Notizen (optional)"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                />
                <div className="flex space-x-2 pt-4">
                  <Button onClick={addItem} className="flex-1">
                    Hinzufügen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddItemOpen(false)}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
