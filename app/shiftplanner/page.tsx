"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Trash2,
  Printer,
  Share,
  RefreshCw,
  Plane,
  Info,
  Star,
  Edit,
  FileText,
  Download,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Calculator,
  Package,
  BarChart3,
  Settings,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import html2canvas from "html2canvas"
import { storageWrapper } from "@/lib/storage-wrapper"
import { migrateFromLocalStorage, verifyMigration } from "@/lib/migrate-data"
import { getStorageStats } from "@/lib/storage-utils"
import Link from 'next/link'

interface Employee {
  id: string
  name: string
  color: string
  customHours?: { [key: string]: number } // date-shift -> hours override
}

interface ShiftAssignment {
  date: string
  shift: "early" | "night"
  employeeId: string | null
}

interface Holiday {
  date: string
  name?: string
}

interface Vacation {
  employeeId: string
  startDate: string
  endDate: string
  description?: string
}

interface MonthInfo {
  month: string
  year: number
  info: string
  type: "frontend" | "backend"
}

interface DayNote {
  date: string
  note: string
}

interface ScheduleData {
  employees: Employee[]
  assignments: ShiftAssignment[]
  holidays: Holiday[]
  vacations: Vacation[]
  monthInfos: MonthInfo[]
  dayNotes: DayNote[]
  lastSaved: number
  dataHash: string
}

const defaultEmployees: Employee[] = [
  { id: "1", name: "Adrian", color: "bg-green-200 text-green-800" },
  { id: "2", name: "Vasil", color: "bg-blue-200 text-blue-800" },
  { id: "3", name: "Sandra", color: "bg-purple-200 text-purple-800" },
  { id: "4", name: "Sabrina", color: "bg-orange-200 text-orange-800" },
  { id: "5", name: "Chiara", color: "bg-pink-200 text-pink-800" },
]

// Dummy data based on the screenshot
const dummyAssignments: ShiftAssignment[] = [
  // Week 1
  { date: "01.08", shift: "early", employeeId: null },
  { date: "01.08", shift: "night", employeeId: null },
  { date: "02.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "02.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "03.08", shift: "early", employeeId: "4" }, // Sabrina
  { date: "03.08", shift: "night", employeeId: "5" }, // Chiara

  // Week 2
  { date: "04.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "04.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "05.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "05.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "06.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "06.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "07.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "07.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "08.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "08.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "09.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "09.08", shift: "night", employeeId: "1" }, // Adrian
  { date: "10.08", shift: "early", employeeId: "4" }, // Sabrina
  { date: "10.08", shift: "night", employeeId: "5" }, // Chiara

  // Week 3
  { date: "11.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "11.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "12.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "12.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "13.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "13.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "14.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "14.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "15.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "15.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "16.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "16.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "17.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "17.08", shift: "night", employeeId: "2" }, // Vasil

  // Week 4
  { date: "18.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "18.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "19.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "19.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "20.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "20.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "21.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "21.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "22.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "22.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "23.08", shift: "early", employeeId: "1" }, // Adrian
  { date: "23.08", shift: "night", employeeId: "2" }, // Vasil
  { date: "24.08", shift: "early", employeeId: "4" }, // Sabrina
  { date: "24.08", shift: "night", employeeId: "5" }, // Chiara

  // Week 5
  { date: "25.08", shift: "early", employeeId: "2" }, // Vasil
  { date: "25.08", shift: "night", employeeId: "1" }, // Adrian
  { date: "26.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "26.08", shift: "night", employeeId: "1" }, // Adrian
  { date: "27.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "27.08", shift: "night", employeeId: "1" }, // Adrian
  { date: "28.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "28.08", shift: "night", employeeId: "1" }, // Adrian
  { date: "29.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "29.08", shift: "night", employeeId: "1" }, // Adrian
  { date: "30.08", shift: "early", employeeId: "3" }, // Sandra
  { date: "30.08", shift: "night", employeeId: "1" }, // Adrian
  { date: "31.08", shift: "early", employeeId: "4" }, // Sabrina
  { date: "31.08", shift: "night", employeeId: "5" }, // Chiara
]

const germanDays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
const germanDaysShort = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const germanMonths = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
]

export default function Dashboard() {
  const modules = [
    {
      id: 'shiftplanner',
      title: 'ShiftPlanner',
      description: 'Verwalten Sie Schichtpläne und Mitarbeiterzuordnungen',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/shiftplanner'
    },
    {
      id: 'geldwechsler',
      title: 'Geldwechsler',
      description: 'Berechnen Sie Geldwechsel und Währungsbeträge',
      icon: Calculator,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/geldwechsler'
    },
    {
      id: 'inventur',
      title: 'Inventur',
      description: 'Verwalten Sie Lagerbestände und Inventarlisten',
      icon: Package,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/inventur'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Übersicht über alle Systeme und Statistiken',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '/dashboard'
    }
  ]

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
              <h1 className="text-xl font-semibold text-gray-900">ShiftPlanner</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Willkommen bei ShiftManager
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl">
            Ihr zentrales System für die Verwaltung von Schichtplänen, Geldwechsel, Inventur und mehr.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 max-w-4xl mx-auto">
          {modules.map((module) => {
            const IconComponent = module.icon
            return (
              <Link
                key={module.id}
                href={module.href}
                className="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-gray-500">
                    <span>Klicken Sie zum Öffnen</span>
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schnellübersicht</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Aktive Schichten</dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Inventur Items</dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calculator className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Letzte Berechnung</dt>
                      <dd className="text-lg font-medium text-gray-900">-</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
