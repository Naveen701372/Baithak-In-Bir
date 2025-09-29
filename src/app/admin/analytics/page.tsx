'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Star,
    Clock,
    Calendar,
    BarChart3,
    RefreshCw,
    Filter,
    PieChart,
    Activity,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAuth } from '@/contexts/AuthContext'

interface AnalyticsData {
    revenue: {
        total: number
        paid: number
        pending: number
        daily: Record<string, any>
        average: number
    }
    orders: {
        total: number
        daily: Record<string, any>
        byStatus: Record<string, number>
    }
    items: {
        popular: Array<{
            id: string
            name: string
            category: string
            quantity: number
            revenue: number
            orders: number
        }>
        topRevenue: Array<any>
        total: number
    }
    hours: {
        hourly: Array<{
            hour: number
            orders: number
            revenue: number
        }>
        peak: {
            hour: number
            orders: number
            revenue: number
        }
    }
    growth: {
        revenue: {
            current: number
            previous: number
            percentage: number
        }
        orders: {
            current: number
            previous: number
            percentage: number
        }
    }
}

function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('7')
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'trends'>('overview')
    const [isFilterCollapsed, setIsFilterCollapsed] = useState(true)

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`/api/analytics?period=${period}`)
            if (!response.ok) {
                throw new Error('Failed to fetch analytics')
            }
            const data = await response.json()
            setAnalyticsData(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount)
    }

    const formatHour = (hour: number) => {
        return new Date(2023, 0, 1, hour).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        })
    }

    const periodOptions = [
        { value: '1', label: 'Last 24 Hours' },
        { value: '7', label: 'Last 7 Days' },
        { value: '30', label: 'Last 30 Days' },
        { value: '90', label: 'Last 3 Months' }
    ]

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading analytics...</span>
                </div>
            </AdminLayout>
        )
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Analytics">
            <div className="space-y-6">

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg border border-gray-200 p-1">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview'
                                ? 'bg-black text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <BarChart3 size={16} className="mr-2" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('items')}
                            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'items'
                                ? 'bg-black text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Star size={16} className="mr-2" />
                            Popular Items
                        </button>
                        <button
                            onClick={() => setActiveTab('trends')}
                            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'trends'
                                ? 'bg-black text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Activity size={16} className="mr-2" />
                            Trends
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div
                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                    >
                        <div className="flex items-center">
                            <Filter size={18} className="text-gray-500 mr-2" />
                            <h3 className="text-sm font-semibold text-gray-900 tracking-wide">Time Period</h3>
                            {isFilterCollapsed && (
                                <span className="ml-2 text-xs text-gray-500">
                                    ({periodOptions.find(o => o.value === period)?.label})
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-3">
                            {!isFilterCollapsed && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        fetchAnalytics()
                                    }}
                                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                                    disabled={loading}
                                >
                                    <RefreshCw size={14} className="mr-2" />
                                    Refresh
                                </button>
                            )}
                            <motion.div
                                animate={{ rotate: isFilterCollapsed ? 0 : 180 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isFilterCollapsed ? (
                                    <ChevronDown size={20} className="text-gray-500" />
                                ) : (
                                    <ChevronUp size={20} className="text-gray-500" />
                                )}
                            </motion.div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {!isFilterCollapsed && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-6 border-t border-gray-100">
                                    <div className="pt-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {periodOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setPeriod(option.value)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 text-center ${period === option.value
                                                        ? 'bg-black text-white border-black shadow-md'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Key Metrics Cards - Show only in Overview tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Revenue */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
                        >
                            <div className="text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <DollarSign size={20} className="text-rose-500" />
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    {analyticsData?.growth?.revenue && analyticsData.growth.revenue.percentage !== 0 && (
                                        <div className={`flex items-center gap-1 text-xs ${analyticsData.growth.revenue.percentage >= 0 ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                            {analyticsData.growth.revenue.percentage >= 0 ?
                                                <TrendingUp size={12} /> : <TrendingDown size={12} />
                                            }
                                            <span>{Math.abs(analyticsData.growth.revenue.percentage).toFixed(1)}%</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                                    {formatCurrency(analyticsData?.revenue?.total || 0)}
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                    Total Revenue
                                </p>
                                <p className="text-xs text-gray-500">
                                    Paid: {formatCurrency(analyticsData?.revenue?.paid || 0)}
                                </p>
                            </div>
                        </motion.div>

                        {/* Total Orders */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
                        >
                            <div className="text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <ShoppingBag size={20} className="text-blue-500" />
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    {analyticsData?.growth?.orders && analyticsData.growth.orders.percentage !== 0 && (
                                        <div className={`flex items-center gap-1 text-xs ${analyticsData.growth.orders.percentage >= 0 ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                            {analyticsData.growth.orders.percentage >= 0 ?
                                                <TrendingUp size={12} /> : <TrendingDown size={12} />
                                            }
                                            <span>{Math.abs(analyticsData.growth.orders.percentage).toFixed(1)}%</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                                    {analyticsData?.orders?.total || 0}
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                    Total Orders
                                </p>
                                <p className="text-xs text-gray-500">
                                    Avg: {formatCurrency(analyticsData?.revenue?.average || 0)}
                                </p>
                            </div>
                        </motion.div>

                        {/* Peak Hour */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
                        >
                            <div className="text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Clock size={20} className="text-amber-500" />
                                </div>
                                <div className="mb-2"></div>
                                <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                                    {formatHour(analyticsData?.hours?.peak?.hour || 0)}
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                    Peak Hour
                                </p>
                                <p className="text-xs text-gray-500">
                                    {analyticsData?.hours?.peak?.orders || 0} orders
                                </p>
                            </div>
                        </motion.div>

                        {/* Menu Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
                        >
                            <div className="text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <BarChart3 size={20} className="text-violet-500" />
                                </div>
                                <div className="mb-2"></div>
                                <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                                    {analyticsData?.items?.total || 0}
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                    Active Items
                                </p>
                                <p className="text-xs text-gray-500">
                                    Tracked in orders
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Content based on active tab */}
                {activeTab === 'items' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg flex items-center justify-center">
                                    <Star size={20} className="text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-black">Best Selling Items</h3>
                                    <p className="text-gray-600 text-sm">Most ordered dishes by quantity</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {analyticsData?.items?.popular?.slice(0, 10).map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="font-medium text-black">{item.name}</div>
                                                <div className="text-sm text-gray-500">{item.category}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-black">{item.quantity} sold</div>
                                            <div className="text-sm text-gray-500">{formatCurrency(item.revenue)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'trends' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Peak Hours Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <Clock size={20} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-black">Business Hours</h3>
                                        <p className="text-gray-600 text-sm">Orders by hour of day</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {analyticsData?.hours?.hourly
                                        ?.filter(hour => hour.orders > 0)
                                        ?.sort((a, b) => b.orders - a.orders)
                                        ?.slice(0, 8)
                                        ?.map((hour) => {
                                            const maxOrders = Math.max(...(analyticsData?.hours?.hourly?.map(h => h.orders) || [1]))
                                            const width = (hour.orders / maxOrders) * 100

                                            return (
                                                <div key={hour.hour} className="flex items-center gap-3">
                                                    <div className="w-16 text-sm text-gray-600">
                                                        {formatHour(hour.hour)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-gray-200 rounded-full h-2">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${width}%` }}
                                                                transition={{ delay: 0.1, duration: 0.5 }}
                                                                className="bg-indigo-400 h-2 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-medium text-black w-12 text-right">
                                                        {hour.orders}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        </motion.div>

                        {/* Revenue by Category */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg flex items-center justify-center">
                                        <PieChart size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-black">Top Revenue Items</h3>
                                        <p className="text-gray-600 text-sm">Highest earning dishes</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {analyticsData?.items?.topRevenue?.slice(0, 8).map((item, index) => {
                                        const maxRevenue = Math.max(...(analyticsData?.items?.topRevenue?.map(i => i.revenue) || [1]))
                                        const width = (item.revenue / maxRevenue) * 100

                                        return (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <div className="w-20 text-sm text-gray-600 truncate">
                                                    {item.name}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-gray-200 rounded-full h-2">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${width}%` }}
                                                            transition={{ delay: 0.1, duration: 0.5 }}
                                                            className="bg-emerald-400 h-2 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-black w-16 text-right">
                                                    {formatCurrency(item.revenue)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Revenue Trend - Show in Overview tab */}
                {activeTab === 'overview' && analyticsData?.revenue?.daily && Object.keys(analyticsData.revenue.daily).length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={20} className="text-teal-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-black">Revenue Trend</h3>
                                    <p className="text-gray-600 text-sm">Daily revenue over selected period</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {Object.entries(analyticsData.revenue.daily)
                                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                                    .slice(-7) // Show last 7 days
                                    .map(([date, data]: [string, any]) => {
                                        const maxRevenue = Math.max(...Object.values(analyticsData.revenue.daily).map((d: any) => d.total))
                                        const width = maxRevenue > 0 ? (data.total / maxRevenue) * 100 : 0

                                        return (
                                            <div key={date} className="flex items-center gap-3">
                                                <div className="w-20 text-sm text-gray-600">
                                                    {new Date(date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-gray-200 rounded-full h-3">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${width}%` }}
                                                            transition={{ delay: 0.1, duration: 0.5 }}
                                                            className="bg-teal-400 h-3 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-black w-20 text-right">
                                                    {formatCurrency(data.total)}
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    )
}

export default withAuth(AnalyticsPage, 'analytics')
