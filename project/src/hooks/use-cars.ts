import { useState, useEffect, useCallback } from 'react'
import { supabase, type Car } from '@/lib/supabase'
import { getSessionKey } from '@/lib/helpers'

type Filters = {
  category?: string
  make?: string
  minPrice?: number
  maxPrice?: number
  fuel_type?: string
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'hp_desc'
}

export function useCars(filters: Filters = {}) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('cars')
      .select('*, car_images(*)')

    if (filters.category) query = query.eq('category', filters.category)
    if (filters.make) query = query.eq('make', filters.make)
    if (filters.fuel_type) query = query.eq('fuel_type', filters.fuel_type)
    if (filters.minPrice) query = query.gte('price', filters.minPrice)
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice)

    if (filters.search) {
      query = query.or(
        `make.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
      )
    }

    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'hp_desc':
        query = query.order('horsepower', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setCars((data as Car[]) ?? [])
    }

    setLoading(false)
  }, [
    filters.category,
    filters.make,
    filters.fuel_type,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.sortBy,
  ])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  return { cars, loading, error, refetch: fetchCars }
}

export function useCar(id: string | undefined) {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetch = async () => {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('id', id)
        .maybeSingle()

      if (err) setError(err.message)
      else setCar(data as Car)
      setLoading(false)
    }

    fetch()

    // Track page view
    supabase.from('page_views').insert({ car_id: id }).then(() => {})
  }, [id])

  return { car, loading, error }
}

export function useFeaturedCars() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('cars')
      .select('*, car_images(*)')
      .eq('featured', true)
      .order('price', { ascending: false })
      .then(({ data }) => {
        setCars((data as Car[]) ?? [])
        setLoading(false)
      })
  }, [])

  return { cars, loading }
}

export function useFavorites() {
  const sessionKey = getSessionKey()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('favorites')
      .select('car_id')
      .eq('session_key', sessionKey)
      .then(({ data }) => {
        setFavoriteIds(new Set((data ?? []).map((f) => f.car_id as string)))
        setLoading(false)
      })
  }, [sessionKey])

  const toggle = useCallback(async (carId: string) => {
    const isFav = favoriteIds.has(carId)

    if (isFav) {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        next.delete(carId)
        return next
      })
      await supabase
        .from('favorites')
        .delete()
        .eq('car_id', carId)
        .eq('session_key', sessionKey)
    } else {
      setFavoriteIds((prev) => new Set([...prev, carId]))
      await supabase
        .from('favorites')
        .insert({ car_id: carId, session_key: sessionKey })
    }
  }, [favoriteIds, sessionKey])

  return { favoriteIds, toggle, loading }
}

export function useAnalytics() {
  const [data, setData] = useState<{
    totalViews: number
    totalCars: number
    totalValue: number
    byCategory: { category: string; count: number }[]
    viewsByDay: { date: string; views: number }[]
    topCars: { id: string; make: string; model: string; views: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [carsRes, viewsRes] = await Promise.all([
        supabase.from('cars').select('id, make, model, category, price'),
        supabase
          .from('page_views')
          .select('car_id, viewed_at')
          .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      const cars = carsRes.data ?? []
      const views = viewsRes.data ?? []

      const totalValue = cars.reduce((sum, c) => sum + (c.price as number), 0)

      const byCategory = Object.entries(
        cars.reduce<Record<string, number>>((acc, c) => {
          acc[c.category] = (acc[c.category] ?? 0) + 1
          return acc
        }, {})
      ).map(([category, count]) => ({ category, count }))

      const viewsByDayMap: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        viewsByDayMap[d.toISOString().split('T')[0]] = 0
      }
      views.forEach((v) => {
        const d = new Date(v.viewed_at as string).toISOString().split('T')[0]
        if (viewsByDayMap[d] !== undefined) viewsByDayMap[d]++
      })
      const viewsByDay = Object.entries(viewsByDayMap).map(([date, count]) => ({
        date,
        views: count,
      }))

      const viewsByCar: Record<string, number> = {}
      views.forEach((v) => {
        viewsByCar[v.car_id as string] = (viewsByCar[v.car_id as string] ?? 0) + 1
      })
      const topCars = cars
        .map((c) => ({ id: c.id as string, make: c.make as string, model: c.model as string, views: viewsByCar[c.id] ?? 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)

      setData({
        totalViews: views.length,
        totalCars: cars.length,
        totalValue,
        byCategory,
        viewsByDay,
        topCars,
      })
      setLoading(false)
    }

    fetch()
  }, [])

  return { data, loading }
}
