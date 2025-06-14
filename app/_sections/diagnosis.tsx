/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState } from 'react'

const Diagnosis = () => {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleSubmit = async (endpoint: 'predict' | 'analyze') => {
    if (!file) return
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error:any) {
      setResult(`❌ Error connecting to the server. ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">🧪 Diagnosis and Analyse</h2>

      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="file:bg-purple-700 file:text-white file:px-4 file:py-2 file:rounded file:cursor-pointer bg-black border border-gray-600 p-2 w-full"
      />

      <div className="flex gap-4">
        <button
          onClick={() => handleSubmit('predict')}
          disabled={loading}
          className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Run Diagnosis'}
        </button>

        <button
          onClick={() => handleSubmit('analyze')}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Run Deep Analysis'}
        </button>
      </div>

      {result && (
        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-green-400 whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  )
}

export default Diagnosis
