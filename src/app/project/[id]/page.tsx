'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ProjectPage() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    router.replace(`/project/${params.id}/research`)
  }, [router, params.id])

  return null
}
