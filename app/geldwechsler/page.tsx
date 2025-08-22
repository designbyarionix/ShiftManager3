"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator, RefreshCw } from "lucide-react"
import Link from 'next/link'

const currencies = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
]

export default function Geldwechsler() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('EUR')
  const [toCurrency, setToCurrency] = useState('USD')
  const [result, setResult] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  // Mock exchange rates (in real app, these would come from an API)
  const mockRates = {
    'EUR': { 'USD': 1.08, 'CHF': 0.95, 'GBP': 0.86, 'JPY': 160.5, 'CNY': 7.8, 'EUR': 1 },
    'USD': { 'EUR': 0.93, 'CHF': 0.88, 'GBP': 0.80, 'JPY': 148.6, 'CNY': 7.2, 'USD': 1 },
    'CHF': { 'EUR': 1.05, 'USD': 1.14, 'GBP': 0.91, 'JPY': 169.0, 'CNY': 8.2, 'CHF': 1 },
    'GBP': { 'EUR': 1.16, 'USD': 1.25, 'CHF': 1.10, 'JPY': 186.6, 'CNY': 9.1, 'GBP': 1 },
    'JPY': { 'EUR': 0.0062, 'USD': 0.0067, 'CHF': 0.0059, 'GBP': 0.0054, 'CNY': 0.049, 'JPY': 1 },
    'CNY': { 'EUR': 0.13, 'USD': 0.14, 'CHF': 0.12, 'GBP': 0.11, 'JPY': 20.4, 'CNY': 1 },
  }

  const calculateExchange = () => {
    if (!amount || isNaN(Number(amount))) {
      setResult(null)
      setExchangeRate(null)
      return
    }

    const numAmount = Number(amount)
    const rate = mockRates[fromCurrency as keyof typeof mockRates]?.[toCurrency as keyof typeof mockRates]
    
    if (rate) {
      setExchangeRate(rate)
      setResult(numAmount * rate)
    }
  }

  const resetForm = () => {
    setAmount('')
    setFromCurrency('EUR')
    setToCurrency('USD')
    setResult(null)
    setExchangeRate(null)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setResult(null)
    setExchangeRate(null)
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
              <h1 className="text-xl font-semibold text-gray-900">Geldwechsler</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={resetForm}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exchange Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Währungsrechner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Betrag</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Currency Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Von</label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nach</label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Swap Button */}
              <Button 
                variant="outline" 
                onClick={swapCurrencies}
                className="w-full"
              >
                Währungen tauschen
              </Button>

              {/* Calculate Button */}
              <Button 
                onClick={calculateExchange}
                disabled={!amount || isNaN(Number(amount))}
                className="w-full"
              >
                Berechnen
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Ergebnis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {result !== null && exchangeRate !== null ? (
                <>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-900">
                      {result.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      {currencies.find(c => c.code === toCurrency)?.symbol} {currencies.find(c => c.code === toCurrency)?.name}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Wechselkurs:</span>
                      <span className="font-medium">
                        1 {currencies.find(c => c.code === fromCurrency)?.code} = {exchangeRate.toFixed(4)} {currencies.find(c => c.code === toCurrency)?.code}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ursprungsbetrag:</span>
                      <span className="font-medium">
                        {amount} {currencies.find(c => c.code === fromCurrency)?.code}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-gray-500">
                  Geben Sie einen Betrag ein und klicken Sie auf "Berechnen"
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Exchange Rates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Aktuelle Wechselkurse (EUR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currencies.filter(c => c.code !== 'EUR').map((currency) => {
                const rate = mockRates['EUR'][currency.code as keyof typeof mockRates['EUR']]
                return (
                  <div key={currency.code} className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">{currency.name}</div>
                    <div className="text-lg font-semibold">{rate?.toFixed(4)}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
