import Link from 'next/link'
import { Calendar, Calculator, Package, BarChart3, Settings } from 'lucide-react'

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">ShiftManager</h1>
              </div>
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
