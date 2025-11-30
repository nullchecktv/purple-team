'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   fetchData()
  // }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/items`)
      const json = await response.json()
      setData(json)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const createItem = async () => {
    setLoading(true)
    try {
      await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Item',
          value: Math.random().toFixed(2)
        })
      })
      await fetchData()
    } catch (err) {
      console.error('Error creating item:', err)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex justify-center">
      <div className="max-w-4xl px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-purple-900 tracking-tight">
            Welcome to Purple Team
          </h1>
          <p className="text-xl text-purple-600 mb-2">Building the future, one feature at a time</p>
          <p className="text-purple-500">R2R Hackathon 2025 💜</p>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center">Upload Your Image</h2>
          <ImageUpload />
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={createItem}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Creating...
              </span>
            ) : (
              '✨ Create New Item'
            )}
          </button>
        </div>

        <div className="grid gap-6">
          {data.length === 0 ? (
            <div className="p-12 bg-white/80 backdrop-blur border-2 border-purple-200 rounded-2xl text-center shadow-lg">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-xl text-purple-700 font-medium mb-2">Ready to get started?</p>
              <p className="text-purple-500">Click the button above to create your first item!</p>
            </div>
          ) : (
            data.map((item: any) => (
              <div
                key={item.id}
                className="p-8 bg-white/90 backdrop-blur border border-purple-200 rounded-2xl hover:shadow-2xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 transform"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900 mb-2">{item.name}</div>
                    <div className="text-lg text-purple-600 font-medium">{item.value}</div>
                  </div>
                  <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                    Active
                  </div>
                </div>
                <div className="text-sm text-purple-400 mt-4 flex items-center gap-2">
                  <span>📅</span>
                  {item.createdAt}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
