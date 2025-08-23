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
  Upload,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import html2canvas from "html2canvas"
import { storageWrapper } from "@/lib/storage-wrapper"
import { migrateFromLocalStorage, verifyMigration } from "@/lib/migrate-data"
import { getStorageStats } from "@/lib/storage-utils"

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

export default function EmployeeScheduler() {
  const searchParams = useSearchParams()
  const isViewOnly = searchParams?.get("view") === "readonly"
  const scheduleRef = useRef<HTMLDivElement>(null)

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    // If we're in August 2025, use current date, otherwise default to August 1st, 2025
    if (now.getFullYear() === 2025 && now.getMonth() === 7) {
      return now
    }
    return new Date(2025, 7, 1) // August 1st, 2025
  })
  const [employees, setEmployees] = useState<Employee[]>(defaultEmployees)
  const [assignments, setAssignments] = useState<ShiftAssignment[]>(dummyAssignments)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [monthInfos, setMonthInfos] = useState<MonthInfo[]>([])
  const [dayNotes, setDayNotes] = useState<DayNote[]>([])
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddVacationOpen, setIsAddVacationOpen] = useState(false)
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isPrintMode, setIsPrintMode] = useState(false)
  const [isBackendPrintMode, setIsBackendPrintMode] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [isMobile, setIsMobile] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [storageStatus, setStorageStatus] = useState<"migrating" | "indexeddb" | "localstorage" | "ready">("migrating")

  // Add after existing state declarations
  const [assignmentHistory, setAssignmentHistory] = useState<ShiftAssignment[][]>([dummyAssignments])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Add new state variables after existing state declarations:

  const [editingHours, setEditingHours] = useState<{
    employeeId: string
    date: string
    shift: "early" | "night"
  } | null>(null)

  // Добави нов state за редактиране на деня след другите state декларации:
  const [editDayOpen, setEditDayOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<string>("")
  const [dayEmployeeHours, setDayEmployeeHours] = useState<{ [key: string]: { early: number; night: number } }>({})

  // Vacation form state
  const [vacationEmployee, setVacationEmployee] = useState("")
  const [vacationStart, setVacationStart] = useState("")
  const [vacationEnd, setVacationEnd] = useState("")
  const [vacationDescription, setVacationDescription] = useState("")

  // Info form state
  const [monthInfo, setMonthInfo] = useState("")
  const [infoType, setInfoType] = useState<"frontend" | "backend">("frontend")

  // Note editing state
  const [noteDate, setNoteDate] = useState("")
  const [noteText, setNoteText] = useState("")

  const availableColors = [
    "bg-red-200 text-red-800",
    "bg-yellow-200 text-yellow-800",
    "bg-indigo-200 text-indigo-800",
    "bg-teal-200 text-teal-800",
    "bg-gray-200 text-gray-800",
  ]

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Migrate data to IndexedDB on component mount
  useEffect(() => {
    const migrateData = async () => {
      try {
        setStorageStatus("migrating")
        
        // Verify IndexedDB is working
        const isWorking = await verifyMigration()
        if (!isWorking) {
          console.warn('IndexedDB not available, using localStorage fallback')
          setStorageStatus("localstorage")
          return
        }

        // Migrate existing data
        const migrationResult = await migrateFromLocalStorage()
        if (migrationResult.success) {
          console.log(`✅ Successfully migrated ${migrationResult.migratedKeys.length} items to IndexedDB`)
          setStorageStatus("indexeddb")
          // Reload data after migration
          await loadData()
          setStorageStatus("ready")
        } else {
          console.warn('Migration had some errors:', migrationResult.errors)
          setStorageStatus("localstorage")
          await loadData()
          setStorageStatus("ready")
        }
      } catch (error) {
        console.error('Migration failed:', error)
        setStorageStatus("localstorage")
      }
    }

    migrateData()
  }, [])

  // Auto-refresh for view-only mode
  useEffect(() => {
    if (isViewOnly) {
      const interval = setInterval(() => {
        loadDataFromUrl()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isViewOnly])

  // Load data for view-only mode
  useEffect(() => {
    if (isViewOnly) {
      loadDataFromUrl()
    }
  }, [isViewOnly, currentDate])

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      const dayOfWeek = dayDate.getDay()
      // Sunday = 0, Monday = 1, ..., Saturday = 6
      const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const fullDate = `${i.toString().padStart(2, "0")}.${(month + 1).toString().padStart(2, "0")}`

      days.push({
        date: i,
        dayName: isMobile ? germanDaysShort[adjustedDayOfWeek] : germanDays[adjustedDayOfWeek],
        fullDate,
        dayOfWeek: adjustedDayOfWeek,
        isHoliday: holidays.some((h) => h.date === fullDate),
      })
    }
    return days
  }

  const getShiftHours = (
    dayOfWeek: number,
    isHoliday: boolean,
    employeeId?: string,
    date?: string,
    shift?: "early" | "night",
  ) => {
    // Check for custom hours first
    if (employeeId && date && shift) {
      const employee = employees.find((e) => e.id === employeeId)
      const customKey = `${date}-${shift}`
      if (employee?.customHours?.[customKey]) {
        return employee.customHours[customKey]
      }
    }

    // Default hours
    if (dayOfWeek === 6 || isHoliday) {
      return 8 // Sunday or Holiday: 8 hours
    }
    return 9 // Monday-Saturday: 9 hours
  }

  const hasCustomHours = (employeeId: string, date: string, shift: "early" | "night") => {
    const employee = employees.find((e) => e.id === employeeId)
    const customKey = `${date}-${shift}`
    return employee?.customHours?.[customKey] !== undefined
  }

  const calculateEmployeeHours = (employeeId: string) => {
    const days = getDaysInMonth(currentDate)
    let totalHours = 0

    days.forEach((day) => {
      const earlyAssignment = getAssignment(day.fullDate, "early")
      const nightAssignment = getAssignment(day.fullDate, "night")

      if (earlyAssignment?.employeeId === employeeId) {
        totalHours += getShiftHours(day.dayOfWeek, day.isHoliday, employeeId, day.fullDate, "early")
      }
      if (nightAssignment?.employeeId === employeeId) {
        totalHours += getShiftHours(day.dayOfWeek, day.isHoliday, employeeId, day.fullDate, "night")
      }
    })

    return totalHours
  }

  const isEmployeeOnVacation = (employeeId: string, date: string) => {
    console.log(`🔍 Checking vacation for employee ${employeeId} on date ${date}`)
    console.log(`📅 Current vacations:`, vacations)
    
    const [day, month] = date.split(".").map(Number)
    const year = currentDate.getFullYear()
    const checkDate = new Date(year, month - 1, day)
    
    console.log(`📅 Check date:`, checkDate.toISOString())

    const result = vacations.some((vacation) => {
      if (vacation.employeeId !== employeeId) return false

      const [startDay, startMonth] = vacation.startDate.split(".").map(Number)
      const [endDay, endMonth] = vacation.endDate.split(".").map(Number)

      const startDate = new Date(year, startMonth - 1, startDay)
      const endDate = new Date(year, endMonth - 1, endDay)
      
      console.log(`📅 Vacation period:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isInRange: checkDate >= startDate && checkDate <= endDate
      })

      return checkDate >= startDate && checkDate <= endDate
    })
    
    console.log(`✅ Vacation check result for ${employeeId} on ${date}:`, result)
    return result
  }

  const getCurrentMonthInfo = (type: "frontend" | "backend") => {
    const monthKey = `${currentDate.getMonth()}-${currentDate.getFullYear()}`
    return monthInfos.find(
      (info) => `${germanMonths.indexOf(info.month)}-${info.year}` === monthKey && info.type === type,
    )
  }

  const getDayNote = (date: string) => {
    return dayNotes.find((note) => note.date === date)
  }

  const getAssignment = (date: string, shift: "early" | "night") => {
    return assignments.find((a) => a.date === date && a.shift === shift)
  }

  const updateAssignment = (date: string, shift: "early" | "night", employeeId: string | null) => {
    console.log(`🔄 updateAssignment called: ${date} ${shift} -> ${employeeId}`)
    
    setAssignments((prev) => {
      const filtered = prev.filter((a) => !(a.date === date && a.shift === shift))
      const newAssignments = employeeId ? [...filtered, { date, shift, employeeId }] : filtered

      console.log(`📝 New assignments:`, newAssignments)

      // Add to history for undo functionality
      setAssignmentHistory((history) => {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newAssignments)
        return newHistory.slice(-50) // Keep last 50 changes
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 49))

      // Automatically save to localStorage after updating assignments
      setTimeout(async () => {
        console.log(`💾 Auto-saving after assignment update...`)
        try {
          await saveDataToStorage()
          console.log(`✅ Auto-save completed successfully`)
        } catch (error) {
          console.error(`❌ Auto-save failed:`, error)
        }
      }, 100)

      return newAssignments
    })
  }

  const undoLastChange = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setAssignments(assignmentHistory[newIndex])
      
      // Automatically save after undo
      setTimeout(async () => {
        try {
          await saveDataToStorage()
          console.log('✅ Data saved after undo')
        } catch (error) {
          console.error('❌ Failed to save after undo:', error)
        }
      }, 100)
    }
  }

  const redoLastChange = () => {
    if (historyIndex < assignmentHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setAssignments(assignmentHistory[newIndex])
      
      // Automatically save after redo
      setTimeout(async () => {
        try {
          await saveDataToStorage()
          console.log('✅ Data saved after redo')
        } catch (error) {
          console.error('❌ Failed to save after redo:', error)
        }
      }, 100)
    }
  }

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undoLastChange()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redoLastChange()
      }
    }

    if (!isViewOnly) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [historyIndex, assignmentHistory, isViewOnly])

  const toggleHoliday = (date: string) => {
    setHolidays((prev) => {
      const exists = prev.find((h) => h.date === date)
      if (exists) {
        return prev.filter((h) => h.date !== date)
      }
      return [...prev, { date }]
    })

          // Automatically save to localStorage after updating holidays
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
  }

  const addEmployee = () => {
    if (newEmployeeName.trim()) {
      const usedColors = employees.map((e) => e.color)
      const availableColor = availableColors.find((color) => !usedColors.includes(color)) || availableColors[0]

      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: newEmployeeName.trim(),
        color: availableColor,
      }
      setEmployees((prev) => [...prev, newEmployee])
      setNewEmployeeName("")
      setIsAddEmployeeOpen(false)

      // Automatically save to localStorage after adding employee
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
    }
  }

  const addVacation = () => {
    if (vacationEmployee && vacationStart && vacationEnd) {
      const newVacation: Vacation = {
        employeeId: vacationEmployee,
        startDate: vacationStart,
        endDate: vacationEnd,
        description: vacationDescription,
      }
      
      console.log('➕ Adding new vacation:', newVacation)
      console.log('📅 Current vacations before adding:', vacations)
      
      setVacations((prev) => {
        const newVacations = [...prev, newVacation]
        console.log('📅 New vacations array:', newVacations)
        return newVacations
      })
      
      setVacationEmployee("")
      setVacationStart("")
      setVacationEnd("")
      setVacationDescription("")
      setIsAddVacationOpen(false)

      // Automatically save to localStorage after adding vacation
      setTimeout(async () => {
        console.log('💾 Auto-saving vacation data...')
        await saveDataToStorage()
        console.log('✅ Vacation auto-save completed')
      }, 100)
    }
  }

  const addMonthInfo = () => {
    if (monthInfo.trim()) {
      const currentMonth = germanMonths[currentDate.getMonth()]
      const currentYear = currentDate.getFullYear()

      const newInfo: MonthInfo = {
        month: currentMonth,
        year: currentYear,
        info: monthInfo.trim(),
        type: infoType,
      }

      setMonthInfos((prev) => {
        const filtered = prev.filter(
          (info) => !(info.month === currentMonth && info.year === currentYear && info.type === infoType),
        )
        return [...filtered, newInfo]
      })
      setMonthInfo("")
      setIsAddInfoOpen(false)

      // Automatically save to localStorage after adding month info
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
    }
  }

  const removeMonthInfo = () => {
    const currentMonth = germanMonths[currentDate.getMonth()]
    const currentYear = currentDate.getFullYear()

    setMonthInfos((prev) =>
      prev.filter((info) => !(info.month === currentMonth && info.year === currentYear && info.type === infoType)),
    )
    setMonthInfo("")
    setIsAddInfoOpen(false)

          // Automatically save to localStorage after removing month info
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
  }

  const generateDataHash = (data: any) => {
    // Create a simple hash from the data
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).slice(0, 16);
  }

  const updateCustomHours = (employeeId: string, date: string, shift: "early" | "night", hours: number) => {
    const customKey = `${date}-${shift}`

    setEmployees((prev) => {
      const updated = prev.map((emp) => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            customHours: {
              ...emp.customHours,
              [customKey]: hours,
            },
          }
        }
        return emp
      })

      // Автоматично запазване
      setTimeout(async () => {
        try {
          await saveDataToStorage(updated)
        } catch (error) {
          console.error('Failed to save custom hours:', error)
        }
      }, 100)

      return updated
    })

    setEditingHours(null)
    setNotification({
      type: "success",
      message: `Stunden für ${date} ${shift === "early" ? "Früh" : "Nacht"} auf ${hours}h aktualisiert und gespeichert!`,
    })
  }

  const saveDataToStorage = async (updatedEmployees?: Employee[]) => {
    const saveKey = `schedule-${currentDate.getMonth()}-${currentDate.getFullYear()}`
    const currentEmployees = updatedEmployees || employees

    const dataToSave: ScheduleData = {
      employees: currentEmployees,
      assignments,
      holidays,
      vacations,
      monthInfos,
      dayNotes,
      lastSaved: Date.now(),
      dataHash: "",
    }

    console.log('💾 Data to save - vacations:', vacations)
    console.log('💾 Data to save - employees:', currentEmployees)
    console.log('💾 Data to save - assignments:', assignments)

    // Генерирай hash
    dataToSave.dataHash = generateDataHash({
      employees: currentEmployees.map((e) => ({ id: e.id, name: e.name, customHours: e.customHours })),
      assignments,
      holidays,
      vacations,
      monthInfos,
      dayNotes,
    })

    console.log(`🔄 Saving data to storage: ${saveKey}`)
    console.log('Data to save:', dataToSave)

    try {
      // Save to storage wrapper (which handles both IndexedDB and localStorage)
      await storageWrapper.setItem(saveKey, JSON.stringify(dataToSave))
      console.log('✅ Successfully saved to storage system')
    } catch (error) {
      console.error('❌ Failed to save data:', error)
      // Emergency fallback to localStorage only
      localStorage.setItem(saveKey, JSON.stringify(dataToSave))
      console.log('✅ Emergency save to localStorage')
    }

    // Генерирай нов share URL
    const currentUrl = window.location.origin + window.location.pathname
    const newShareUrl = `${currentUrl}?view=readonly&month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}&hash=${dataToSave.dataHash}`
    setShareUrl(newShareUrl)
    setLastUpdate(Date.now())

    console.log('💾 Save operation completed successfully')
    return dataToSave.dataHash
  }

  const addDayNote = () => {
    if (noteDate && noteText.trim()) {
      setDayNotes((prev) => {
        const filtered = prev.filter((note) => note.date !== noteDate)
        return [...filtered, { date: noteDate, note: noteText.trim() }]
      })
      setNoteDate("")
      setNoteText("")
      setIsAddNoteOpen(false)
      setNotification({ type: "success", message: "Notiz erfolgreich hinzugefügt!" })

      // Automatically save to localStorage after adding day note
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
    }
  }

  const removeDayNote = (date: string) => {
    setDayNotes((prev) => prev.filter((note) => note.date !== date))
    setNotification({ type: "success", message: "Notiz entfernt!" })

          // Automatically save to localStorage after removing day note
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
  }

  const removeEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId))
    setAssignments((prev) => prev.filter((a) => a.employeeId !== employeeId))
    setVacations((prev) => prev.filter((v) => v.employeeId !== employeeId))

          // Automatically save to localStorage after removing employee
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
  }

  const removeVacation = (index: number) => {
    setVacations((prev) => prev.filter((_, i) => i !== index))

          // Automatically save to localStorage after removing vacation
      setTimeout(async () => {
        await saveDataToStorage()
      }, 100)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handlePrint = () => {
    setIsPrintMode(true)
    setTimeout(() => {
      window.print()
      setIsPrintMode(false)
    }, 100)
  }

  const handleBackendPrint = () => {
    setIsBackendPrintMode(true)
    setTimeout(() => {
      window.print()
      setIsBackendPrintMode(false)
    }, 100)
  }

  const saveData = async () => {
    const hash = await saveDataToStorage()
    setNotification({
      type: "success",
      message: "Plan erfolgreich gespeichert!",
    })
  }

  const loadData = async () => {
    const saveKey = `schedule-${currentDate.getMonth()}-${currentDate.getFullYear()}`
    console.log(`🔄 Loading data for key: ${saveKey}`)
    
    try {
      // Try to load from IndexedDB first (primary source)
      console.log('📊 Attempting to load from IndexedDB...')
      let savedData = await storageWrapper.getItem(saveKey)
      
      if (savedData) {
        console.log('✅ Data found in IndexedDB, length:', savedData.length)
        try {
          const data: ScheduleData = JSON.parse(savedData)
          console.log('📝 Parsed data from IndexedDB:', {
            employees: data.employees?.length || 0,
            assignments: data.assignments?.length || 0,
            holidays: data.holidays?.length || 0,
            vacations: data.vacations?.length || 0,
            monthInfos: data.monthInfos?.length || 0,
            dayNotes: data.dayNotes?.length || 0
          })
          
          // Set data from IndexedDB (primary source)
          setEmployees(data.employees || defaultEmployees)
          setAssignments(data.assignments || dummyAssignments)
          setHolidays(data.holidays || [])
          setVacations(data.vacations || [])
          setMonthInfos(data.monthInfos || [])
          setDayNotes(data.dayNotes || [])
          setLastUpdate(data.lastSaved || Date.now())

          console.log('🎯 Set vacations from IndexedDB:', data.vacations || [])
          console.log('🎯 Set employees from IndexedDB:', data.employees || defaultEmployees)

          setNotification({
            type: "success",
            message: "Plan erfolgreich geladen!",
          })
          return // Exit early, data loaded successfully
        } catch (error) {
          console.error('❌ Error parsing IndexedDB data:', error)
        }
      }
      
      // Fallback to localStorage only if IndexedDB fails completely
      console.log('⚠️ No data in IndexedDB, trying localStorage fallback...')
      const localData = localStorage.getItem(saveKey)
      if (localData) {
        try {
          const data: ScheduleData = JSON.parse(localData)
          console.log('📝 Parsed data from localStorage fallback:', {
            employees: data.employees?.length || 0,
            assignments: data.assignments?.length || 0,
            holidays: data.holidays?.length || 0,
            vacations: data.vacations?.length || 0,
            monthInfos: data.monthInfos?.length || 0,
            dayNotes: data.dayNotes?.length || 0
          })
          
          // Set data from localStorage fallback
          setEmployees(data.employees || defaultEmployees)
          setAssignments(data.assignments || dummyAssignments)
          setHolidays(data.holidays || [])
          setVacations(data.vacations || [])
          setMonthInfos(data.monthInfos || [])
          setDayNotes(data.dayNotes || [])
          setLastUpdate(data.lastSaved || Date.now())
          
          console.log('🎯 Set vacations from final localStorage fallback:', data.vacations || [])
          console.log('🎯 Set employees from final localStorage fallback:', data.employees || defaultEmployees)

          setNotification({
            type: "success",
            message: "Plan erfolgreich geladen!",
          })
        } catch (error) {
          console.error('❌ Error parsing localStorage data:', error)
          setNotification({
            type: "error",
            message: "Fehler beim Laden der Daten!",
          })
        }
      } else {
        console.log('❌ No data found in either storage')
      }
    } catch (error) {
      console.warn('❌ Failed to load from IndexedDB, trying localStorage:', error)
      // Final fallback to localStorage
      const localData = localStorage.getItem(saveKey)
      if (localData) {
        try {
          const data: ScheduleData = JSON.parse(localData)
          setEmployees(data.employees || defaultEmployees)
          setAssignments(data.assignments || dummyAssignments)
          setHolidays(data.holidays || [])
          setVacations(data.vacations || [])
          setMonthInfos(data.monthInfos || [])
          setDayNotes(data.dayNotes || [])
          setLastUpdate(data.lastSaved || Date.now())
        } catch (error) {
          console.error('❌ Error parsing localStorage data:', error)
        }
      }
    }
  }

  const loadDataFromUrl = async () => {
    const urlHash = searchParams?.get("hash")
    if (urlHash && isViewOnly) {
      const saveKey = `schedule-${currentDate.getMonth()}-${currentDate.getFullYear()}`
      
      try {
        // Try to load from IndexedDB first
        let savedData = await storageWrapper.getItem(saveKey)
        
        // Fallback to localStorage if IndexedDB fails
        if (!savedData) {
          savedData = localStorage.getItem(saveKey)
        }

        if (savedData) {
          try {
            const data: ScheduleData = JSON.parse(savedData)
            if (data.dataHash === urlHash) {
              setEmployees(data.employees || defaultEmployees)
              setAssignments(data.assignments || dummyAssignments)
              setHolidays(data.holidays || [])
              setVacations(data.vacations || [])
              setMonthInfos(data.monthInfos || [])
              setDayNotes(data.dayNotes || [])
              setLastUpdate(data.lastSaved || Date.now())
            }
          } catch (error) {
            console.error("Error loading data from URL:", error)
          }
        }
      } catch (error) {
        console.warn('Failed to load from IndexedDB, trying localStorage:', error)
        // Fallback to localStorage
        const savedData = localStorage.getItem(saveKey)
        if (savedData) {
          try {
            const data: ScheduleData = JSON.parse(savedData)
            if (data.dataHash === urlHash) {
              setEmployees(data.employees || defaultEmployees)
              setAssignments(data.assignments || dummyAssignments)
              setHolidays(data.holidays || [])
              setVacations(data.vacations || [])
              setMonthInfos(data.monthInfos || [])
              setDayNotes(data.dayNotes || [])
              setLastUpdate(data.lastSaved || Date.now())
            }
          } catch (error) {
            console.error("Error loading data from URL:", error)
          }
        }
      }
    } else {
      await loadData()
    }
  }

  const addQuickNote = (date: string) => {
    setNoteDate(date)
    setIsAddNoteOpen(true)
  }

  const openDayEdit = (date: string) => {
    setEditingDay(date)

    // Подготви данните за деня
    const dayHours: { [key: string]: { early: number; night: number } } = {}

    employees.forEach((emp) => {
      const earlyAssignment = getAssignment(date, "early")
      const nightAssignment = getAssignment(date, "night")

      const day = getDaysInMonth(currentDate).find((d) => d.fullDate === date)
      const dayOfWeek = day?.dayOfWeek || 0
      const isHoliday = day?.isHoliday || false

      dayHours[emp.id] = {
        early: earlyAssignment?.employeeId === emp.id ? getShiftHours(dayOfWeek, isHoliday, emp.id, date, "early") : 0,
        night: nightAssignment?.employeeId === emp.id ? getShiftHours(dayOfWeek, isHoliday, emp.id, date, "night") : 0,
      }
    })

    setDayEmployeeHours(dayHours)
    setEditDayOpen(true)
  }

  const saveDayHours = () => {
    Object.entries(dayEmployeeHours).forEach(([employeeId, hours]) => {
      if (hours.early > 0) {
        updateCustomHours(employeeId, editingDay, "early", hours.early)
      }
      if (hours.night > 0) {
        updateCustomHours(employeeId, editingDay, "night", hours.night)
      }
    })

    // Automatically save after updating day hours
    setTimeout(async () => {
      try {
        await saveDataToStorage()
        console.log('✅ Data saved after updating day hours')
      } catch (error) {
        console.error('❌ Failed to save after updating day hours:', error)
      }
    }, 100)

    setEditDayOpen(false)
    setEditingDay("")
    setDayEmployeeHours({})
  }

  const generateAndOpenShareUrl = async () => {
    // Първо запази данните
    const hash = await saveDataToStorage()

    // След това отвори линка
    setTimeout(() => {
      if (shareUrl) {
        navigator.clipboard.writeText(shareUrl)
        window.open(shareUrl, "_blank")
        setNotification({ type: "success", message: "Aktueller Link generiert, kopiert und geöffnet!" })
      }
    }, 200)
  }

  // Add data export functionality
  const exportData = async () => {
    try {
      const dataToExport = {
        employees,
        assignments,
        holidays,
        vacations,
        monthInfos,
        dayNotes,
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        exportDate: new Date().toISOString(),
        version: "1.0"
      }
      
      const dataStr = JSON.stringify(dataToExport, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `shiftmanager-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}.json`
      link.click()
      
      setNotification({ type: "success", message: "Daten erfolgreich exportiert!" })
    } catch (error) {
      console.error('Export failed:', error)
      setNotification({ type: "error", message: "Export fehlgeschlagen!" })
    }
  }

  // Add data import functionality
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedData = JSON.parse(text)
      
      // Validate imported data
      if (importedData.assignments && importedData.employees) {
        // Check if data is for the same month/year
        if (importedData.month === currentDate.getMonth() && importedData.year === currentDate.getFullYear()) {
          setEmployees(importedData.employees)
          setAssignments(importedData.assignments)
          setHolidays(importedData.holidays || [])
          setVacations(importedData.vacations || [])
          setMonthInfos(importedData.monthInfos || [])
          setDayNotes(importedData.dayNotes || [])
          
          // Save imported data to storage
          await saveDataToStorage()
          
          setNotification({ type: "success", message: "Daten erfolgreich importiert und gespeichert!" })
        } else {
          setNotification({ type: "error", message: "Importierte Daten sind für einen anderen Monat/Jahr!" })
        }
      } else {
        setNotification({ type: "error", message: "Ungültiges Datenformat!" })
      }
    } catch (error) {
      console.error('Import failed:', error)
      setNotification({ type: "error", message: "Import fehlgeschlagen!" })
    }
    
    // Reset file input
    event.target.value = ''
  }

  const updateEmployeeHours = (employeeId: string, newHours: number) => {
    // Това е опростена версия - в реалното приложение трябва да се специфицира дата/смяна
    const employee = employees.find((e) => e.id === employeeId)
    if (employee) {
      const currentHours = calculateEmployeeHours(employeeId)
      const difference = newHours - currentHours

      // Намери първата смяна на служителя и промени часовете
      const days = getDaysInMonth(currentDate)
      for (const day of days) {
        const earlyAssignment = getAssignment(day.fullDate, "early")
        const nightAssignment = getAssignment(day.fullDate, "night")

        if (earlyAssignment?.employeeId === employeeId) {
          const currentShiftHours = getShiftHours(day.dayOfWeek, day.isHoliday, employeeId, day.fullDate, "early")
          const newShiftHours = Math.max(0, Math.min(24, currentShiftHours + difference))
          updateCustomHours(employeeId, day.fullDate, "early", newShiftHours)
          break
        } else if (nightAssignment?.employeeId === employeeId) {
          const currentShiftHours = getShiftHours(day.dayOfWeek, day.isHoliday, employeeId, day.fullDate, "night")
          const newShiftHours = Math.max(0, Math.min(24, currentShiftHours + difference))
          updateCustomHours(employeeId, day.fullDate, "night", newShiftHours)
          break
        }
      }
    }
  }



  const exportAsImage = async () => {
    if (scheduleRef.current) {
      try {
        // Create a temporary container with better styling for screenshot
        const tempContainer = document.createElement("div")
        tempContainer.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 1200px;
          background: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          padding: 20px;
        `

        // Clone the schedule content
        const clone = scheduleRef.current.cloneNode(true) as HTMLElement

        // Remove interactive elements and improve styling
        const selects = clone.querySelectorAll("select, [data-radix-select-trigger]")
        selects.forEach((select) => {
          const parent = select.parentElement
          if (parent) {
            const value = select.getAttribute("aria-label") || select.textContent?.trim() || "-"
            const span = document.createElement("span")
            span.textContent = value
            span.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px 2px;
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: white;
            font-size: 10px;
            line-height: 1.2;
            height: 24px;
            overflow: hidden;
            word-wrap: break-word;
            hyphens: auto;
          `

            // Apply employee colors if present
            const colorClasses = select.className.match(/bg-\\w+-\\d+/g)
            if (colorClasses && colorClasses.length > 0) {
              const colorClass = colorClasses[0]
              if (colorClass.includes("green")) span.style.backgroundColor = "#dcfce7"
              if (colorClass.includes("blue")) span.style.backgroundColor = "#dbeafe"
              if (colorClass.includes("purple")) span.style.backgroundColor = "#f3e8ff"
              if (colorClass.includes("orange")) span.style.backgroundColor = "#fed7aa"
              if (colorClass.includes("pink")) span.style.backgroundColor = "#fce7f3"
              if (colorClass.includes("red")) span.style.backgroundColor = "#fee2e2"
              if (colorClass.includes("yellow")) span.style.backgroundColor = "#fef3c7"
            }

            parent.replaceChild(span, select)
          }
        })

        // Improve table styling
        const tables = clone.querySelectorAll("table")
        tables.forEach((table) => {
          table.style.cssText += "; border-collapse: collapse; width: 100%;"
          const cells = table.querySelectorAll("td, th")
          cells.forEach((cell) => {
            cell.style.cssText += `; 
            border: 1px solid #333; 
            padding: 6px 4px; 
            text-align: center; 
            vertical-align: middle;
            font-size: 10px;
            line-height: 1.2;
            word-wrap: break-word;
            max-width: 80px;
          `
          })
        })

        tempContainer.appendChild(clone)
        document.body.appendChild(tempContainer)

        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: false,
          foreignObjectRendering: false,
          logging: false,
          width: 1200,
          height: tempContainer.scrollHeight,
          onclone: (clonedDoc) => {
            const clonedContainer = clonedDoc.querySelector("div")
            if (clonedContainer) {
              clonedContainer.style.position = "static"
              clonedContainer.style.top = "auto"
              clonedContainer.style.left = "auto"
            }
          },
        })

        document.body.removeChild(tempContainer)

        const link = document.createElement("a")
        link.download = `schichtplan-${currentMonth}-${currentYear}.png`
        link.href = canvas.toDataURL("image/png", 1.0)
        link.click()

        setNotification({ type: "success", message: "Schichtplan als Bild gespeichert!" })
      } catch (error) {
        setNotification({ type: "error", message: "Fehler beim Exportieren des Bildes!" })
      }
    }
  }

  const days = getDaysInMonth(currentDate)
  const currentMonth = germanMonths[currentDate.getMonth()]
  const currentYear = currentDate.getFullYear()
  const currentMonthInfoFrontend = getCurrentMonthInfo("frontend")
  const currentMonthInfoBackend = getCurrentMonthInfo("backend")

  // Group days into weeks for calendar layout
  const weeks = []
  let currentWeek = []
  let startPadding = 0

  // Find the first day of the month and calculate padding
  if (days.length > 0) {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const firstDayOfWeek = firstDay.getDay()
    startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Adjust for Monday start
  }

  // Add padding for the first week
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push(null)
  }

  days.forEach((day, index) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  // Add the last week if it has days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  if (isBackendPrintMode) {
    const totalHours = employees.reduce((total, emp) => total + calculateEmployeeHours(emp.id), 0)

    return (
      <div className="print:block hidden">
        <style jsx global>{`
          @media print {
            * { page-break-inside: avoid !important; }
            body { margin: 0; padding: 4px; font-size: 8px; }
            .backend-print-container { page-break-after: avoid !important; page-break-inside: avoid !important; }
            .backend-print-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: avoid !important; }
            .backend-print-table th, .backend-print-table td { border: 1px solid #000; padding: 2px; text-align: left; font-size: 7px; line-height: 1.1; }
            .backend-print-header { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; font-weight: bold; }
            .backend-print-total { background-color: #fef3c7 !important; -webkit-print-color-adjust: exact; font-weight: bold; }
            .backend-print-vacation { background-color: #fee2e2 !important; -webkit-print-color-adjust: exact; font-weight: bold; border: 2px solid #dc2626 !important; }
            .backend-print-vacation-cell { background-color: #fef2f2 !important; -webkit-print-color-adjust: exact; font-weight: bold; }
            h1 { font-size: 12px; margin: 2px 0; page-break-after: avoid !important; }
            h3 { font-size: 9px; margin: 4px 0 2px 0; page-break-after: avoid !important; }
            p { font-size: 7px; margin: 1px 0; }
            .vacation-summary { margin-bottom: 6px; padding: 3px; font-size: 7px; page-break-inside: avoid !important; }
            .summary-section { page-break-inside: avoid !important; margin-top: 6px; }
            .notes-section { page-break-inside: avoid !important; margin-top: 6px; }
            .management-notes { page-break-inside: avoid !important; margin-top: 6px; padding: 3px; font-size: 7px; }
          }
        `}</style>
        <div className="backend-print-container">
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold">
            BACKEND REPORT - {currentMonth.toUpperCase()} {currentYear}
          </h1>
          <p className="text-sm">Detaillierte Arbeitszeiten für Management</p>
        </div>



        {/* Vacation Summary - Simple List */}
        {vacations.length > 0 && (
          <div className="vacation-summary border border-red-300 bg-red-50 rounded">
            <h3 className="font-bold text-red-700">Urlaubstage:</h3>
            <div className="text-red-600">
              {vacations.map((vacation, index) => {
                const employee = employees.find((e) => e.id === vacation.employeeId)
                return (
                  <div key={index}>
                    {employee?.name}: {vacation.startDate} - {vacation.endDate}
                    {vacation.description && ` (${vacation.description})`}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <table className="backend-print-table">
          <thead>
            <tr className="backend-print-header">
              <th>Datum</th>
              <th>Tag</th>
              <th>Frühschicht</th>
              <th>Stunden</th>
              <th>Nachtschicht</th>
              <th>Stunden</th>
              <th>Notizen</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const earlyAssignment = getAssignment(day.fullDate, "early")
              const nightAssignment = getAssignment(day.fullDate, "night")
              const earlyEmployee = earlyAssignment ? employees.find((e) => e.id === earlyAssignment.employeeId) : null
              const nightEmployee = nightAssignment ? employees.find((e) => e.id === nightAssignment.employeeId) : null
              const earlyHours = earlyEmployee
                ? getShiftHours(day.dayOfWeek, day.isHoliday, earlyEmployee.id, day.fullDate, "early")
                : 0
              const nightHours = nightEmployee
                ? getShiftHours(day.dayOfWeek, day.isHoliday, nightEmployee.id, day.fullDate, "night")
                : 0
              const dayNote = getDayNote(day.fullDate)

              return (
                <tr key={day.fullDate}>
                  <td>{day.fullDate}</td>
                  <td>
                    {day.dayName} {day.isHoliday && "(Feiertag)"}
                  </td>
                  <td>
                    {earlyEmployee ? (
                      <>
                        {earlyEmployee.name}
                        {isEmployeeOnVacation(earlyEmployee.id, day.fullDate) && " ✈️"}
                      </>
                    ) : "-"}
                  </td>
                  <td>{earlyHours > 0 ? `${earlyHours}h` : "-"}</td>
                  <td>
                    {nightEmployee ? (
                      <>
                        {nightEmployee.name}
                        {isEmployeeOnVacation(nightEmployee.id, day.fullDate) && " ✈️"}
                      </>
                    ) : "-"}
                  </td>
                  <td>{nightHours > 0 ? `${nightHours}h` : "-"}</td>
                  <td>{dayNote ? dayNote.note : "-"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="summary-section">
          <h3 className="font-bold">ZUSAMMENFASSUNG</h3>
          <table className="backend-print-table">
            <thead>
              <tr className="backend-print-header">
                <th>Mitarbeiter</th>
                <th>Gesamtstunden</th>
                <th>Urlaubstage</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const employeeVacations = vacations.filter((v) => v.employeeId === employee.id)
                return (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{calculateEmployeeHours(employee.id)}h</td>
                    <td>{employeeVacations.map((v) => `${v.startDate}-${v.endDate}`).join(", ") || "-"}</td>
                  </tr>
                )
              })}
              <tr className="backend-print-total">
                <td>
                  <strong>GESAMT</strong>
                </td>
                <td>
                  <strong>{totalHours}h</strong>
                </td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes section for backend print */}
        {dayNotes.length > 0 && (
          <div className="notes-section">
            <h3 className="font-bold">TAGESNOTIZEN</h3>
            <table className="backend-print-table">
              <thead>
                <tr className="backend-print-header">
                  <th>Datum</th>
                  <th>Notiz</th>
                </tr>
              </thead>
              <tbody>
                {dayNotes.map((note, index) => (
                  <tr key={index}>
                    <td>{note.date}</td>
                    <td>{note.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentMonthInfoBackend && (
          <div className="management-notes border border-gray-400">
            <strong>Management Notizen:</strong>
            <br />
            {currentMonthInfoBackend.info}
          </div>
        )}
        </div>
      </div>
    )
  }

  if (isPrintMode) {
    return (
      <div className="print:block hidden">
        <style jsx global>{`
          @media print {
            body { margin: 0; padding: 8px; font-size: 9px; }
            .print-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .print-table th, .print-table td { border: 1px solid #000; padding: 3px; text-align: center; font-size: 8px; }
            .print-header { background-color: #fbbf24 !important; -webkit-print-color-adjust: exact; font-weight: bold; }
            .print-holiday { background-color: #fef3c7 !important; -webkit-print-color-adjust: exact; }
            .print-date-row { font-weight: bold; background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
            .print-vacation { font-style: italic; }
            .print-info { margin-top: 10px; padding: 8px; border: 1px solid #000; background-color: #f9fafb !important; -webkit-print-color-adjust: exact; }
            .print-vacation-list { margin-top: 8px; font-size: 7px; }
          
          /* Employee colors for print */
          .print-employee-green { background-color: #dcfce7 !important; color: #166534 !important; -webkit-print-color-adjust: exact; }
          .print-employee-blue { background-color: #dbeafe !important; color: #1e40af !important; -webkit-print-color-adjust: exact; }
          .print-employee-purple { background-color: #f3e8ff !important; color: #7c3aed !important; -webkit-print-color-adjust: exact; }
          .print-employee-orange { background-color: #fed7aa !important; color: #ea580c !important; -webkit-print-color-adjust: exact; }
          .print-employee-pink { background-color: #fce7f3 !important; color: #be185d !important; -webkit-print-color-adjust: exact; }
          .print-employee-red { background-color: #fee2e2 !important; color: #dc2626 !important; -webkit-print-color-adjust: exact; }
          .print-employee-yellow { background-color: #fef3c7 !important; color: #d97706 !important; -webkit-print-color-adjust: exact; }
          .print-employee-indigo { background-color: #e0e7ff !important; color: #4338ca !important; -webkit-print-color-adjust: exact; }
          .print-employee-teal { background-color: #ccfbf1 !important; color: #0f766e !important; -webkit-print-color-adjust: exact; }
          .print-employee-gray { background-color: #f3f4f6 !important; color: #374151 !important; -webkit-print-color-adjust: exact; }
          .print-vacation-day { background-color: #fee2e2 !important; -webkit-print-color-adjust: exact; border: 2px solid #dc2626 !important; font-weight: bold; }
          .print-vacation-employee { background-color: #fef2f2 !important; -webkit-print-color-adjust: exact; font-weight: bold; border: 2px solid #dc2626 !important; }
        }
      `}</style>
        <div className="text-center mb-2">
          <h1 className="text-base font-bold">
            PLAY GER - {currentMonth.toUpperCase()} {currentYear}
          </h1>
        </div>

        {/* Vacation List for Print */}
        {vacations.length > 0 && (
          <div className="print-vacation-list mb-2 p-1 border border-red-300 bg-red-50 rounded">
            <div className="text-xs font-bold text-red-700 mb-1">Urlaub:</div>
            <div className="text-xs text-red-600">
              {vacations.map((vacation, index) => {
                const employee = employees.find((e) => e.id === vacation.employeeId)
                return (
                  <span key={index}>
                    {employee?.name} ({vacation.startDate}-{vacation.endDate})
                    {index < vacations.length - 1 && ", "}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <table className="print-table">
          <thead>
            <tr className="print-header">
              <th>Schicht</th>
              {(isMobile ? germanDaysShort : germanDays).map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <>
                {/* Date row */}
                <tr key={`dates-${weekIndex}`} className="print-date-row">
                  <td>Datum</td>
                  {week.map((day, dayIndex) => {
                    if (!day) return <td key={`empty-date-${dayIndex}`}></td>
                    const dayNote = getDayNote(day.fullDate)
                    return (
                      <td key={`date-${day.date}`} className={day.isHoliday ? "print-holiday" : ""}>
                        {day.fullDate}
                        {day.isHoliday && " ★"}
                        {dayNote && " 📝"}
                      </td>
                    )
                  })}
                </tr>
                {/* Early shift row */}
                <tr key={`early-${weekIndex}`}>
                  <td className="font-medium">Frühschicht</td>
                  {week.map((day, dayIndex) => {
                    if (!day) return <td key={`empty-early-${dayIndex}`}></td>
                    const assignment = getAssignment(day.fullDate, "early")
                    const employee = assignment ? employees.find((e) => e.id === assignment.employeeId) : null
                    const onVacation = employee && isEmployeeOnVacation(employee.id, day.fullDate)

                    const getEmployeePrintClass = (color: string) => {
                      if (color.includes("green")) return "print-employee-green"
                      if (color.includes("blue")) return "print-employee-blue"
                      if (color.includes("purple")) return "print-employee-purple"
                      if (color.includes("orange")) return "print-employee-orange"
                      if (color.includes("pink")) return "print-employee-pink"
                      if (color.includes("red")) return "print-employee-red"
                      if (color.includes("yellow")) return "print-employee-yellow"
                      if (color.includes("indigo")) return "print-employee-indigo"
                      if (color.includes("teal")) return "print-employee-teal"
                      if (color.includes("gray")) return "print-employee-gray"
                      return ""
                    }

                    return (
                      <td key={`early-${day.date}`} className={day.isHoliday ? "print-holiday" : ""}>
                        {employee ? (
                          <span
                            className={`${getEmployeePrintClass(employee.color)} px-1 rounded`}
                          >
                            {employee.name}
                            {onVacation && " ✈️"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    )
                  })}
                </tr>
                {/* Night shift row */}
                <tr key={`night-${weekIndex}`}>
                  <td className="font-medium">Nachtschicht</td>
                  {week.map((day, dayIndex) => {
                    if (!day) return <td key={`empty-night-${dayIndex}`}></td>
                    const assignment = getAssignment(day.fullDate, "night")
                    const employee = assignment ? employees.find((e) => e.id === assignment.employeeId) : null
                    const onVacation = employee && isEmployeeOnVacation(employee.id, day.fullDate)

                    const getEmployeePrintClass = (color: string) => {
                      if (color.includes("green")) return "print-employee-green"
                      if (color.includes("blue")) return "print-employee-blue"
                      if (color.includes("purple")) return "print-employee-purple"
                      if (color.includes("orange")) return "print-employee-orange"
                      if (color.includes("pink")) return "print-employee-pink"
                      if (color.includes("red")) return "print-employee-red"
                      if (color.includes("yellow")) return "print-employee-yellow"
                      if (color.includes("indigo")) return "print-employee-indigo"
                      if (color.includes("teal")) return "print-employee-teal"
                      if (color.includes("gray")) return "print-employee-gray"
                      return ""
                    }

                    return (
                      <td key={`night-${day.date}`} className={day.isHoliday ? "print-holiday" : ""}>
                        {employee ? (
                          <span
                            className={`${getEmployeePrintClass(employee.color)} px-1 rounded`}
                          >
                            {employee.name}
                            {onVacation && " ✈️"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    )
                  })}
                </tr>
              </>
            ))}
          </tbody>
        </table>

        {/* Notes section for print */}
        {dayNotes.length > 0 && (
          <div className="print-info">
            <strong>Tagesnotizen:</strong>
            <br />
            {dayNotes.map((note, index) => (
              <div key={index} style={{ fontSize: "7px", marginTop: "2px" }}>
                <strong>{note.date}:</strong> {note.note}
              </div>
            ))}
          </div>
        )}

        {/* Info section for print */}
        {currentMonthInfoFrontend && (
          <div className="print-info">
            <strong>Informationen:</strong>
            <br />
            {currentMonthInfoFrontend.info}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`p-2 sm:p-4 max-w-full mx-auto ${isViewOnly ? "bg-gray-50" : ""}`}>
      {/* Storage Status */}
      {storageStatus !== "ready" && (
        <Alert className="mb-4 border-blue-500 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {storageStatus === "migrating" && "🔄 Migrating your data to IndexedDB for better performance..."}
            {storageStatus === "indexeddb" && "✅ Data migrated to IndexedDB successfully! Better performance and storage capacity."}
            {storageStatus === "localstorage" && "⚠️ Using localStorage fallback. Some features may be limited."}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Persistence Notice */}
      <Alert className="mb-4 border-orange-500 bg-orange-50">
        <Info className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>💡 Tipp:</strong> Daten werden nur lokal gespeichert. Um zwischen verschiedenen Geräten/Umgebungen zu synchronisieren, 
          verwenden Sie die <strong>Export</strong> und <strong>Import</strong> Buttons. 
          Exportieren Sie Ihre Daten nach dem Speichern und importieren Sie sie in der neuen Umgebung.
        </AlertDescription>
      </Alert>

      {/* Notification */}
      {notification && (
        <Alert
          className={`mb-4 ${notification.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={notification.type === "success" ? "text-green-800" : "text-red-800"}>
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      {!isViewOnly && (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 print:hidden gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-center">
              {currentMonth.toUpperCase()} {currentYear}
            </h1>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
            <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={saveData}>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Speichern</span>
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={undoLastChange}
              disabled={historyIndex <= 0}
              title="Rückgängig (Ctrl+Z)"
            >
              <span className="text-xs sm:text-sm">↶</span>
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={redoLastChange}
              disabled={historyIndex >= assignmentHistory.length - 1}
              title="Wiederholen (Ctrl+Y)"
            >
              <span className="text-xs sm:text-sm">↷</span>
            </Button>

            <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={handleBackendPrint}>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Backend</span>
            </Button>
            <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={exportAsImage}>
              <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Bild</span>
            </Button>

            <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={exportData}>
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Export</span>
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button variant="outline" size={isMobile ? "sm" : "sm"} asChild>
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Import</span>
                </label>
              </Button>
            </div>

            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"} 
              onClick={async () => {
                console.log('🧪 Testing save functionality...')
                try {
                  const hash = await saveDataToStorage()
                  console.log('✅ Test save successful! Hash:', hash)
                  setNotification({
                    type: "success",
                    message: "Test save successful! Check console for details."
                  })
                } catch (error) {
                  console.error('❌ Test save failed:', error)
                  setNotification({
                    type: "error",
                    message: "Test save failed! Check console for details."
                  })
                }
              }}
              title="Test Save Function"
            >
              🧪
            </Button>




            <Dialog open={isAddInfoOpen} onOpenChange={setIsAddInfoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "default"}>
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Info</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">
                    {getCurrentMonthInfo(infoType) ? "Information bearbeiten" : "Monats-Information hinzufügen"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Typ</label>
                    <Select value={infoType} onValueChange={(value: "frontend" | "backend") => setInfoType(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Für Mitarbeiter</SelectItem>
                        <SelectItem value="backend">Für Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Information für {currentMonth} {currentYear} (
                      {infoType === "frontend" ? "Mitarbeiter" : "Management"})
                    </label>
                    <Textarea
                      placeholder="Wichtige Informationen, Änderungen, Notizen..."
                      value={monthInfo || getCurrentMonthInfo(infoType)?.info || ""}
                      onChange={(e) => setMonthInfo(e.target.value)}
                      className="w-full min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={addMonthInfo}
                      className="flex-1"
                      disabled={!monthInfo.trim() && !getCurrentMonthInfo(infoType)?.info}
                    >
                      {getCurrentMonthInfo(infoType) ? "Aktualisieren" : "Speichern"}
                    </Button>
                    {getCurrentMonthInfo(infoType) && (
                      <Button variant="destructive" onClick={removeMonthInfo} className="flex-1">
                        Löschen
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddInfoOpen(false)
                        setMonthInfo("")
                      }}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddVacationOpen} onOpenChange={setIsAddVacationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "default"}>
                  <Plane className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Urlaub</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Urlaub hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mitarbeiter</label>
                    <Select value={vacationEmployee} onValueChange={setVacationEmployee}>
                      <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400">
                        <SelectValue placeholder="Mitarbeiter auswählen" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id} className="hover:bg-gray-100 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${emp.color.split(" ")[0]}`}></div>
                              {emp.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Startdatum</label>
                    <Input
                      placeholder="TT.MM (z.B. 15.08)"
                      value={vacationStart}
                      onChange={(e) => setVacationStart(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enddatum</label>
                    <Input
                      placeholder="TT.MM (z.B. 20.08)"
                      value={vacationEnd}
                      onChange={(e) => setVacationEnd(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Beschreibung (optional)</label>
                    <Input
                      placeholder="z.B. Sommerurlaub"
                      value={vacationDescription}
                      onChange={(e) => setVacationDescription(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={addVacation}
                      className="flex-1"
                      disabled={!vacationEmployee || !vacationStart || !vacationEnd}
                    >
                      Urlaub hinzufügen
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddVacationOpen(false)} className="flex-1">
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "sm" : "default"}>
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Mitarbeiter</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Neuen Mitarbeiter hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Name des Mitarbeiters"
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addEmployee()}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={addEmployee} className="flex-1" disabled={!newEmployeeName.trim()}>
                      Hinzufügen
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)} className="flex-1">
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {isViewOnly && (
        <div className="text-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {currentMonth.toUpperCase()} {currentYear}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Schichtplan - Nur Ansicht</p>
          <div className="flex gap-2 justify-center mt-2">
            <Button variant="outline" size="sm" onClick={loadDataFromUrl} className="bg-transparent">
              <RefreshCw className="h-3 w-3 mr-1" />
              Laden
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsImage} className="bg-transparent">
              <Download className="h-3 w-3 mr-1" />
              Speichern
            </Button>
          </div>
        </div>
      )}



      {/* Current month info display */}
      {currentMonthInfoFrontend && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Information für {currentMonth} {currentYear}:
              </p>
              <p className="text-sm text-blue-700 mt-1">{currentMonthInfoFrontend.info}</p>
            </div>
          </div>
        </div>
      )}



      {!isViewOnly && (
        <div className="mb-4 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Mitarbeiter & Stunden</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge className={`${employee.color} text-xs`}>{employee.name}</Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono">{calculateEmployeeHours(employee.id)}h</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newHours = prompt(
                              `Stunden für ${employee.name} bearbeiten:`,
                              calculateEmployeeHours(employee.id).toString(),
                            )
                            if (newHours && !isNaN(Number(newHours))) {
                              updateEmployeeHours(employee.id, Number(newHours))
                            }
                          }}
                          className="h-4 w-4 p-0 hover:bg-blue-100"
                          title="Stunden bearbeiten"
                        >
                          <Edit className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmployee(employee.id)}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Urlaub & Notizen</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {vacations.map((vacation, index) => {
                  const employee = employees.find((e) => e.id === vacation.employeeId)
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded bg-blue-50">
                      <div className="text-xs">
                        <span className="font-medium">{employee?.name}</span>
                        <div className="text-gray-600">
                          {vacation.startDate} - {vacation.endDate}
                        </div>
                        {vacation.description && <div className="text-gray-500">{vacation.description}</div>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVacation(index)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
                {dayNotes.map((note, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded bg-yellow-50">
                    <div className="text-xs">
                      <span className="font-medium">{note.date}</span>
                      <div className="text-gray-600">{note.note}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDayNote(note.date)}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {vacations.length === 0 && dayNotes.length === 0 && (
                  <p className="text-xs text-gray-500">Keine Einträge</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Notiz für {noteDate} hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notiz</label>
              <Textarea
                placeholder="z.B. Kurze Schicht wegen Arzttermin, Überstunden, etc."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[100px] w-full"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={addDayNote} className="flex-1" disabled={!noteText.trim()}>
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddNoteOpen(false)
                  setNoteText("")
                  setNoteDate("")
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Edit Dialog */}
      <Dialog open={editDayOpen} onOpenChange={setEditDayOpen}>
        <DialogContent className="w-[95vw] max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Tag bearbeiten: {editingDay}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto">
            {employees.map((employee) => {
              const earlyAssignment = getAssignment(editingDay, "early")
              const nightAssignment = getAssignment(editingDay, "night")
              const isWorkingEarly = earlyAssignment?.employeeId === employee.id
              const isWorkingNight = nightAssignment?.employeeId === employee.id

              if (!isWorkingEarly && !isWorkingNight) return null

              return (
                <div key={employee.id} className="border rounded p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${employee.color.split(" ")[0]}`}></div>
                    <span className="font-medium">{employee.name}</span>
                  </div>

                  {isWorkingEarly && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-green-700">
                        Frühschicht: {dayEmployeeHours[employee.id]?.early || 0}h
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="0.5"
                        value={dayEmployeeHours[employee.id]?.early || 0}
                        onChange={(e) => {
                          const hours = Number.parseFloat(e.target.value)
                          setDayEmployeeHours((prev) => ({
                            ...prev,
                            [employee.id]: {
                              ...prev[employee.id],
                              early: hours,
                            },
                          }))
                        }}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0h</span>
                        <span>12h</span>
                        <span>24h</span>
                      </div>
                    </div>
                  )}

                  {isWorkingNight && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700">
                        Nachtschicht: {dayEmployeeHours[employee.id]?.night || 0}h
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="0.5"
                        value={dayEmployeeHours[employee.id]?.night || 0}
                        onChange={(e) => {
                          const hours = Number.parseFloat(e.target.value)
                          setDayEmployeeHours((prev) => ({
                            ...prev,
                            [employee.id]: {
                              ...prev[employee.id],
                              night: hours,
                            },
                          }))
                        }}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0h</span>
                        <span>12h</span>
                        <span>24h</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex gap-2 pt-4">
              <Button onClick={saveDayHours} className="flex-1">
                Stunden speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditDayOpen(false)
                  setEditingDay("")
                  setDayEmployeeHours({})
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div ref={scheduleRef}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-yellow-500 text-white py-2">
            <CardTitle className="text-center text-base sm:text-lg">PLAY GER</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-1 sm:p-2 bg-gray-100 w-16 sm:w-24">Schicht</th>
                    {(isMobile ? germanDaysShort : germanDays).map((day) => (
                      <th key={day} className="border border-gray-300 p-1 sm:p-2 bg-gray-100 min-w-12 sm:min-w-20">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, weekIndex) => (
                    <>
                      {/* Date row - only show once per week */}
                      <tr key={`dates-${weekIndex}`} className="bg-gray-50">
                        <td className="border border-gray-300 p-1 sm:p-2 font-medium text-xs">Datum</td>
                        {week.map((day, dayIndex) => {
                          if (!day)
                            return <td key={`empty-date-${dayIndex}`} className="border border-gray-300 p-1"></td>
                          const dayNote = getDayNote(day.fullDate)
                          return (
                            <td
                              key={`date-${day.date}`}
                              className={`border border-gray-300 p-1 text-center text-xs font-medium ${
                                day.isHoliday ? "bg-yellow-100" : ""
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {day.fullDate}
                                {day.isHoliday && <Star className="h-3 w-3 text-yellow-600" />}
                                {dayNote && (
                                  <span className="text-orange-600 cursor-help" title={dayNote.note}>
                                    📝
                                  </span>
                                )}
                                {!isViewOnly && (
                                  <button
                                    onClick={() => openDayEdit(day.fullDate)}
                                    className="text-green-600 hover:bg-green-100 w-3 h-3 flex items-center justify-center rounded text-xs ml-1"
                                    title="Tag bearbeiten"
                                  >
                                    <Edit className="h-2 w-2" />
                                  </button>
                                )}
                                {!isViewOnly && (
                                  <button
                                    onClick={() => addQuickNote(day.fullDate)}
                                    className="text-blue-600 hover:bg-blue-100 w-3 h-3 flex items-center justify-center rounded text-xs ml-1"
                                    title="Notiz hinzufügen"
                                  >
                                    <Edit className="h-2 w-2" />
                                  </button>
                                )}
                                {!isViewOnly && (
                                  <button
                                    onClick={() => toggleHoliday(day.fullDate)}
                                    className="text-red-600 hover:bg-red-100 w-3 h-3 flex items-center justify-center rounded ml-1"
                                    title="Als Feiertag markieren"
                                  >
                                    <Star className="h-2 w-2" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                      {/* Early shift row */}
                      <tr key={`early-${weekIndex}`}>
                        <td className="border border-gray-300 p-1 sm:p-2 font-medium bg-gray-50 text-xs">Früh</td>
                        {week.map((day, dayIndex) => {
                          if (!day) return <td key={`empty-early-${dayIndex}`} className="border border-gray-300 p-1"></td>

                          const assignment = getAssignment(day.fullDate, "early")
                          const employee = assignment ? employees.find((e) => e.id === assignment.employeeId) : null
                          const hasCustom = employee && hasCustomHours(employee.id, day.fullDate, "early")

                          return (
                            <td
                              key={`early-${day.date}`}
                              className={`border border-gray-300 p-1 relative ${
                                day.isHoliday ? "bg-yellow-100" : ""
                              }`}
                            >
                              {isViewOnly ? (
                                <div
                                  className={`text-xs p-1 rounded text-center ${employee ? employee.color : ""} relative ${
                                    employee && isEmployeeOnVacation(employee.id, day.fullDate) 
                                      ? "border-2 border-red-500" 
                                      : ""
                                  }`}
                                >
                                  {employee ? (
                                    <>
                                      {employee.name}
                                      {isEmployeeOnVacation(employee.id, day.fullDate) && (
                                        <span className="ml-1">✈️</span>
                                      )}
                                      {hasCustom && (
                                        <Clock className="h-2 w-2 absolute top-0 right-0 text-orange-600" />
                                      )}
                                    </>
                                  ) : (
                                    "-"
                                  )}
                                </div>
                              ) : (
                                <div className="relative">
                                  {editingHours?.employeeId === employee?.id &&
                                  editingHours?.date === day.fullDate &&
                                  editingHours?.shift === "early" ? (
                                    <Input
                                      type="number"
                                      step="0.5"
                                      defaultValue={getShiftHours(
                                        day.dayOfWeek,
                                        day.isHoliday,
                                        employee?.id,
                                        day.fullDate,
                                        "early",
                                      )}
                                      onBlur={(e) => {
                                        const hours = Number.parseFloat(e.target.value)
                                        if (hours > 0 && employee) {
                                          updateCustomHours(employee.id, day.fullDate, "early", hours)
                                        } else {
                                          setEditingHours(null)
                                        }
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          const hours = Number.parseFloat((e.target as HTMLInputElement).value)
                                          if (hours > 0 && employee) {
                                            updateCustomHours(employee.id, day.fullDate, "early", hours)
                                          } else {
                                            setEditingHours(null)
                                          }
                                        }
                                      }}
                                      className="w-full h-6 text-xs"
                                      autoFocus
                                    />
                                  ) : (
                                    <Select
                                      value={assignment?.employeeId || "none"}
                                      onValueChange={(value) =>
                                        updateAssignment(day.fullDate, "early", value === "none" ? null : value)
                                      }
                                    >
                                      <SelectTrigger
                                        className={`w-full h-6 sm:h-8 text-xs ${employee ? employee.color : "bg-white"} hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 relative ${
                                          employee && isEmployeeOnVacation(employee.id, day.fullDate) 
                                            ? "border-2 border-red-500 ring-red-500" 
                                            : ""
                                        }`}
                                        onDoubleClick={() => {
                                          if (employee) {
                                            setEditingHours({
                                              employeeId: employee.id,
                                              date: day.fullDate,
                                              shift: "early",
                                            })
                                          }
                                        }}
                                        title={
                                          employee
                                            ? `Doppelklick zum Bearbeiten der Stunden (${getShiftHours(day.dayOfWeek, day.isHoliday, employee.id, day.fullDate, "early")}h)`
                                            : ""
                                        }
                                      >
                                        <SelectValue>
                                          {employee ? (
                                            <div className="flex items-center justify-center w-full relative">
                                              <span className="truncate">{employee.name}</span>
                                              {isEmployeeOnVacation(employee.id, day.fullDate) && (
                                                <span className="ml-1">✈️</span>
                                              )}
                                              {hasCustom && (
                                                <Clock className="h-2 w-2 absolute top-0 right-0 text-orange-600" />
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg rounded-md">
                                        <SelectItem value="none" className="hover:bg-gray-100 cursor-pointer px-3 py-2">
                                          <span className="text-gray-500">Keine Auswahl</span>
                                        </SelectItem>
                                        {employees.map((emp) => (
                                          <SelectItem
                                            key={emp.id}
                                            value={emp.id}
                                            className="hover:bg-gray-100 cursor-pointer px-3 py-2"
                                          >
                                            <div className="flex items-center gap-2 w-full">
                                              <div className={`w-3 h-3 rounded-full ${emp.color.split(" ")[0]}`}></div>
                                              <span className="flex-1">{emp.name}</span>
                                              {isEmployeeOnVacation(emp.id, day.fullDate) && <span>✈️</span>}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                      {/* Night shift row */}
                      <tr key={`night-${weekIndex}`}>
                        <td className="border border-gray-300 p-1 sm:p-2 font-medium bg-gray-50 text-xs">Nacht</td>
                        {week.map((day, dayIndex) => {
                          if (!day)
                            return <td key={`empty-night-${dayIndex}`} className="border border-gray-300 p-1"></td>

                          const assignment = getAssignment(day.fullDate, "night")
                          const employee = assignment ? employees.find((e) => e.id === assignment.employeeId) : null
                          const hasCustom = employee && hasCustomHours(employee.id, day.fullDate, "night")

                          return (
                            <td
                              key={`night-${day.date}`}
                              className={`border border-gray-300 p-1 ${
                                day.isHoliday ? "bg-yellow-100" : ""
                              }`}
                            >
                              {isViewOnly ? (
                                <div
                                  className={`text-xs p-1 rounded text-center ${employee ? employee.color : ""} relative ${
                                    employee && isEmployeeOnVacation(employee.id, day.fullDate) 
                                      ? "border-2 border-red-500" 
                                      : ""
                                  }`}
                                >
                                  {employee ? (
                                    <>
                                      {employee.name}
                                      {isEmployeeOnVacation(employee.id, day.fullDate) && (
                                        <span className="ml-1">✈️</span>
                                      )}
                                      {hasCustom && (
                                        <Clock className="h-2 w-2 absolute top-0 right-0 text-orange-600" />
                                      )}
                                    </>
                                  ) : (
                                    "-"
                                  )}
                                </div>
                              ) : (
                                <div className="relative">
                                  {editingHours?.employeeId === employee?.id &&
                                  editingHours?.date === day.fullDate &&
                                  editingHours?.shift === "night" ? (
                                    <Input
                                      type="number"
                                      step="0.5"
                                      defaultValue={getShiftHours(
                                        day.dayOfWeek,
                                        day.isHoliday,
                                        employee?.id,
                                        day.fullDate,
                                        "night",
                                      )}
                                      onBlur={(e) => {
                                        const hours = Number.parseFloat(e.target.value)
                                        if (hours > 0 && employee) {
                                          updateCustomHours(employee.id, day.fullDate, "night", hours)
                                        } else {
                                          setEditingHours(null)
                                        }
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          const hours = Number.parseFloat((e.target as HTMLInputElement).value)
                                          if (hours > 0 && employee) {
                                            updateCustomHours(employee.id, day.fullDate, "night", hours)
                                          } else {
                                            setEditingHours(null)
                                          }
                                        }
                                      }}
                                      className="w-full h-6 text-xs"
                                      autoFocus
                                    />
                                  ) : (
                                    <Select
                                      value={assignment?.employeeId || "none"}
                                      onValueChange={(value) =>
                                        updateAssignment(day.fullDate, "night", value === "none" ? null : value)
                                      }
                                    >
                                      <SelectTrigger
                                        className={`w-full h-6 sm:h-8 text-xs ${employee ? employee.color : "bg-white"} hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 relative ${
                                          employee && isEmployeeOnVacation(employee.id, day.fullDate) 
                                            ? "border-2 border-red-500 ring-red-500" 
                                            : ""
                                        }`}
                                        onDoubleClick={() => {
                                          if (employee) {
                                            setEditingHours({
                                              employeeId: employee.id,
                                              date: day.fullDate,
                                              shift: "night",
                                            })
                                          }
                                        }}
                                        title={
                                          employee
                                            ? `Doppelklick zum Bearbeiten der Stunden (${getShiftHours(day.dayOfWeek, day.isHoliday, employee.id, day.fullDate, "night")}h)`
                                            : ""
                                        }
                                      >
                                        <SelectValue>
                                          {employee ? (
                                            <div className="flex items-center justify-center w-full relative">
                                              <span className="truncate">{employee.name}</span>
                                              {isEmployeeOnVacation(employee.id, day.fullDate) && (
                                                <span className="ml-1">✈️</span>
                                              )}
                                              {hasCustom && (
                                                <Clock className="h-2 w-2 absolute top-0 right-0 text-orange-600" />
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg rounded-md">
                                        <SelectItem value="none" className="hover:bg-gray-100 cursor-pointer px-3 py-2">
                                          <span className="text-gray-500">Keine Auswahl</span>
                                        </SelectItem>
                                        {employees.map((emp) => (
                                          <SelectItem
                                            key={emp.id}
                                            value={emp.id}
                                            className="hover:bg-gray-100 cursor-pointer px-3 py-2"
                                          >
                                            <div className="flex items-center gap-2 w-full">
                                              <div className={`w-3 h-3 rounded-full ${emp.color.split(" ")[0]}`}></div>
                                              <span className="flex-1">{emp.name}</span>
                                              {isEmployeeOnVacation(emp.id, day.fullDate) && <span>✈️</span>}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isViewOnly && (
        <div className="mt-4 text-xs text-gray-600 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Arbeitszeiten Mo-Sa:</h4>
              <p>Frühschicht: 09:00 - 18:00</p>
              <p>Nachtschicht: 18:00 - 03:00</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Arbeitszeiten So/Feiertage:</h4>
              <p>Frühschicht: 11:00 - 19:00</p>
              <p>Nachtschicht: 19:00 - 03:00</p>
              <p className="mt-2 text-blue-600">💡 Doppelklick auf Mitarbeiternamen zum Bearbeiten der Stunden</p>
              <p className="text-orange-600">🕒 Uhr-Symbol zeigt geänderte Stunden an</p>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
