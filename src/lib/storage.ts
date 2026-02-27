'use client'

import { StoredProject } from '@/types'

const STORAGE_KEY = 'somarhelp_projects'

export function getProjects(): StoredProject[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getProject(id: string): StoredProject | null {
  const projects = getProjects()
  return projects.find(p => p.id === id) || null
}

export function saveProject(project: StoredProject): void {
  const projects = getProjects()
  const index = projects.findIndex(p => p.id === project.id)
  if (index >= 0) {
    projects[index] = project
  } else {
    projects.unshift(project)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getStats() {
  const projects = getProjects()
  const totalPosts = projects.reduce((acc, p) => acc + p.posts.length, 0)
  const totalCampaigns = projects.filter(p => p.campaign).length
  const allScores = projects.flatMap(p => p.evaluations.map(e => e.average))
  const avgFireScore = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : '—'

  return {
    totalProjects: projects.length,
    totalPosts,
    totalCampaigns,
    avgFireScore,
  }
}
