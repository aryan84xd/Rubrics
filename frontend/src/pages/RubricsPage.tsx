"use client"

import type React from "react"
import { useState, useEffect } from "react"
import RubricsDisplay from "./RubricsDisplay"

interface RubricsEntry {
  assignmentId: string
  rollNumber: string
  year: number
  knowledge: number
  description: number
  demonstration: number
  strategy: number
  attitude: number
}

const RubricsPage: React.FC = () => {
  const [rubricsData, setRubricsData] = useState<RubricsEntry | null>(null)

  useEffect(() => {
    // Simulating an API call with setTimeout
    setTimeout(() => {
      const sampleEntry: RubricsEntry = {
        assignmentId: "67b6c8a867bad3b438569f83",
        rollNumber: "I020",
        year: 2026,
        knowledge: 4,
        description: 3,
        demonstration: 5,
        strategy: 4,
        attitude: 5,
      }
      setRubricsData(sampleEntry)
    }, 1000) // Simulating a 1-second delay
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Student Assignment Rubrics</h1>
      {rubricsData ? (
        <RubricsDisplay entry={rubricsData} />
      ) : (
        <div className="text-center">Loading rubrics data...</div>
      )}
    </div>
  )
}

export default RubricsPage

