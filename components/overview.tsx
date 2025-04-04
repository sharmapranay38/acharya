"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Mon",
    flashcards: 12,
    summaries: 5,
    podcasts: 2,
  },
  {
    name: "Tue",
    flashcards: 18,
    summaries: 8,
    podcasts: 3,
  },
  {
    name: "Wed",
    flashcards: 15,
    summaries: 6,
    podcasts: 4,
  },
  {
    name: "Thu",
    flashcards: 25,
    summaries: 10,
    podcasts: 5,
  },
  {
    name: "Fri",
    flashcards: 20,
    summaries: 12,
    podcasts: 6,
  },
  {
    name: "Sat",
    flashcards: 10,
    summaries: 4,
    podcasts: 2,
  },
  {
    name: "Sun",
    flashcards: 5,
    summaries: 2,
    podcasts: 1,
  },
]

export function Overview() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="flashcards" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
          <Bar dataKey="summaries" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-purple-500" />
          <Bar dataKey="podcasts" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-green-500" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

