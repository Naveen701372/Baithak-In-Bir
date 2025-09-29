import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '7' // days
        const metric = searchParams.get('metric') || 'all'

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        let analyticsData: any = {}

        // Revenue Analytics
        if (metric === 'all' || metric === 'revenue') {
            const { data: revenueData } = await supabase
                .from('orders')
                .select('total_amount, created_at, payment_status')
                .gte('created_at', startDate.toISOString())
                .neq('status', 'cancelled')

            // Calculate daily revenue
            const dailyRevenue = revenueData?.reduce((acc: any, order) => {
                const date = new Date(order.created_at).toDateString()
                if (!acc[date]) {
                    acc[date] = { total: 0, paid: 0, pending: 0 }
                }
                acc[date].total += parseFloat(order.total_amount)
                if (order.payment_status === 'paid') {
                    acc[date].paid += parseFloat(order.total_amount)
                } else {
                    acc[date].pending += parseFloat(order.total_amount)
                }
                return acc
            }, {})

            // Calculate total and average revenue
            const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
            const paidRevenue = revenueData?.filter(o => o.payment_status === 'paid')
                .reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

            analyticsData.revenue = {
                total: totalRevenue,
                paid: paidRevenue,
                pending: totalRevenue - paidRevenue,
                daily: dailyRevenue,
                average: revenueData?.length ? totalRevenue / revenueData.length : 0
            }
        }

        // Order Volume Analytics
        if (metric === 'all' || metric === 'orders') {
            const { data: orderData } = await supabase
                .from('orders')
                .select('id, created_at, status')
                .gte('created_at', startDate.toISOString())

            // Calculate daily order counts
            const dailyOrders = orderData?.reduce((acc: any, order) => {
                const date = new Date(order.created_at).toDateString()
                if (!acc[date]) {
                    acc[date] = { total: 0, completed: 0, pending: 0, cancelled: 0 }
                }
                acc[date].total += 1
                acc[date][order.status] = (acc[date][order.status] || 0) + 1
                return acc
            }, {})

            analyticsData.orders = {
                total: orderData?.length || 0,
                daily: dailyOrders,
                byStatus: orderData?.reduce((acc: any, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1
                    return acc
                }, {})
            }
        }

        // Popular Items Analytics
        if (metric === 'all' || metric === 'items') {
            const { data: itemData } = await supabase
                .from('order_items')
                .select(`
          quantity,
          total_price,
          menu_item_id,
          menu_items(name, price, category_id, categories(name)),
          orders!inner(created_at, status)
        `)
                .gte('orders.created_at', startDate.toISOString())
                .neq('orders.status', 'cancelled')

            // Calculate item popularity
            const itemStats = itemData?.reduce((acc: any, item) => {
                const itemId = item.menu_item_id
                const itemName = item.menu_items?.name || 'Unknown Item'
                const categoryName = item.menu_items?.categories?.name || 'Uncategorized'

                if (!acc[itemId]) {
                    acc[itemId] = {
                        id: itemId,
                        name: itemName,
                        category: categoryName,
                        quantity: 0,
                        revenue: 0,
                        orders: 0
                    }
                }

                acc[itemId].quantity += item.quantity
                acc[itemId].revenue += parseFloat(item.total_price)
                acc[itemId].orders += 1
                return acc
            }, {})

            const popularItems = Object.values(itemStats || {})
                .sort((a: any, b: any) => b.quantity - a.quantity)
                .slice(0, 10)

            const topRevenueItems = Object.values(itemStats || {})
                .sort((a: any, b: any) => b.revenue - a.revenue)
                .slice(0, 10)

            analyticsData.items = {
                popular: popularItems,
                topRevenue: topRevenueItems,
                total: Object.keys(itemStats || {}).length
            }
        }

        // Peak Hours Analytics
        if (metric === 'all' || metric === 'hours') {
            const { data: hourData } = await supabase
                .from('orders')
                .select('created_at, total_amount')
                .gte('created_at', startDate.toISOString())
                .neq('status', 'cancelled')

            // Calculate hourly distribution
            const hourlyStats = hourData?.reduce((acc: any, order) => {
                const hour = new Date(order.created_at).getHours()
                if (!acc[hour]) {
                    acc[hour] = { orders: 0, revenue: 0 }
                }
                acc[hour].orders += 1
                acc[hour].revenue += parseFloat(order.total_amount)
                return acc
            }, {})

            // Fill missing hours with 0
            const completeHourlyStats = Array.from({ length: 24 }, (_, hour) => ({
                hour,
                orders: hourlyStats?.[hour]?.orders || 0,
                revenue: hourlyStats?.[hour]?.revenue || 0
            }))

            analyticsData.hours = {
                hourly: completeHourlyStats,
                peak: completeHourlyStats.reduce((max, current) =>
                    current.orders > max.orders ? current : max,
                    { hour: 0, orders: 0, revenue: 0 }
                )
            }
        }

        // Growth Analytics (compare with previous period)
        if (metric === 'all' || metric === 'growth') {
            const previousStartDate = new Date(startDate)
            previousStartDate.setDate(previousStartDate.getDate() - parseInt(period))

            const { data: previousData } = await supabase
                .from('orders')
                .select('total_amount, created_at')
                .gte('created_at', previousStartDate.toISOString())
                .lt('created_at', startDate.toISOString())
                .neq('status', 'cancelled')

            const previousRevenue = previousData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
            const currentRevenue = analyticsData.revenue?.total || 0
            const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

            const previousOrderCount = previousData?.length || 0
            const currentOrderCount = analyticsData.orders?.total || 0
            const orderGrowth = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0

            analyticsData.growth = {
                revenue: {
                    current: currentRevenue,
                    previous: previousRevenue,
                    percentage: revenueGrowth
                },
                orders: {
                    current: currentOrderCount,
                    previous: previousOrderCount,
                    percentage: orderGrowth
                }
            }
        }

        return NextResponse.json(analyticsData)
    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        )
    }
}
