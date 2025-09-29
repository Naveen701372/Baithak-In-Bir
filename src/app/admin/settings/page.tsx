'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Upload,
    Save,
    Image as ImageIcon,
    Palette,
    Phone,
    Mail,
    MapPin,
    Loader2,
    User,
    Settings as SettingsIcon,
    PhoneCall
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings'
import { supabase } from '@/lib/supabase'
import { withAuth } from '@/contexts/AuthContext'

function RestaurantSettingsPage() {
    const { settings, loading, updateSettings } = useRestaurantSettings()
    const [saving, setSaving] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const [formData, setFormData] = useState({
        restaurant_name: '',
        tagline: '',
        branding_display: 'both' as 'logo' | 'text' | 'both',
        primary_color: '#14b8a6',
        secondary_color: '#0f766e',
        accent_color: '#f0fdfa',
        text_color: '#111827',
        phone: '',
        email: '',
        address: '',
        logo_url: ''
    })

    const tabs = [
        { id: 'basic', label: 'Basic', icon: User },
        { id: 'theme', label: 'Theme', icon: Palette },
        { id: 'contact', label: 'Contact', icon: PhoneCall },
    ]

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Update form data when settings load
    React.useEffect(() => {
        if (settings) {
            setFormData({
                restaurant_name: settings.restaurant_name || '',
                tagline: settings.tagline || '',
                branding_display: settings.branding_display || 'both',
                primary_color: settings.primary_color || '#14b8a6',
                secondary_color: settings.secondary_color || '#0f766e',
                accent_color: settings.accent_color || '#f0fdfa',
                text_color: settings.text_color || '#111827',
                phone: settings.phone || '',
                email: settings.email || '',
                address: settings.address || '',
                logo_url: settings.logo_url || ''
            })
        }
    }, [settings])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setUploadingLogo(true)

            // Create a unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `logo-${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('restaurant-assets')
                .upload(fileName, file)

            if (error) {
                console.error('Error uploading logo:', error)
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('restaurant-assets')
                .getPublicUrl(fileName)

            setFormData(prev => ({
                ...prev,
                logo_url: publicUrl
            }))
        } catch (error) {
            console.error('Error uploading logo:', error)
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await updateSettings(formData)
            // You could add a toast notification here
        } catch (error) {
            console.error('Error saving settings:', error)
            // You could add an error toast here
        } finally {
            setSaving(false)
        }
    }

    const colorPresets = [
        { name: 'Teal (Default)', primary: '#14b8a6', secondary: '#0f766e', accent: '#f0fdfa' },
        { name: 'Blue', primary: '#3b82f6', secondary: '#2563eb', accent: '#eff6ff' },
        { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#f3f4f6' },
        { name: 'Green', primary: '#10b981', secondary: '#059669', accent: '#ecfdf5' },
        { name: 'Orange', primary: '#f59e0b', secondary: '#d97706', accent: '#fffbeb' },
        { name: 'Pink', primary: '#ec4899', secondary: '#db2777', accent: '#fdf2f8' },
    ]

    const applyColorPreset = (preset: typeof colorPresets[0]) => {
        setFormData(prev => ({
            ...prev,
            primary_color: preset.primary,
            secondary_color: preset.secondary,
            accent_color: preset.accent
        }))
    }

    if (loading) {
        return (
            <AdminLayout title="Settings">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Settings">
            <div className="min-h-screen bg-white">
                {/* Mobile Tab Navigation */}
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                    <div className="flex">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center py-4 px-2 text-sm font-light tracking-wide transition-colors ${activeTab === tab.id
                                        ? 'text-black border-b-2 border-black'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mb-1" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                    Restaurant Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.restaurant_name}
                                    onChange={(e) => handleInputChange('restaurant_name', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                    placeholder="Enter restaurant name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                    Tagline
                                </label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                    placeholder="Optional tagline"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                    Restaurant Logo
                                </label>
                                {formData.logo_url && (
                                    <div className="w-20 h-20 border border-gray-200 rounded-sm flex items-center justify-center overflow-hidden bg-gray-50 mb-3">
                                        <img
                                            src={formData.logo_url}
                                            alt="Restaurant Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <motion.button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingLogo}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-400 rounded-lg hover:border-gray-600 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium tracking-wide text-gray-700 hover:text-gray-900 shadow-sm"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {uploadingLogo ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                </motion.button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-light">JPG, PNG, or SVG. Max 2MB.</p>
                            </div>

                            {/* Branding Display Options */}
                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-6 tracking-wide">
                                    Branding Display
                                </label>
                                <div className="space-y-6">
                                    <p className="text-sm text-gray-600 font-light">
                                        Choose how to display your restaurant branding
                                    </p>

                                    {/* Options List */}
                                    <div className="space-y-3">
                                        {[
                                            {
                                                value: 'both',
                                                label: 'Logo + Text',
                                                description: 'Display both logo and restaurant name',
                                                icon: '🏷️'
                                            },
                                            {
                                                value: 'logo',
                                                label: 'Logo Only',
                                                description: 'Display only the logo image',
                                                icon: '🖼️'
                                            },
                                            {
                                                value: 'text',
                                                label: 'Text Only',
                                                description: 'Display only the restaurant name',
                                                icon: '📝'
                                            }
                                        ].map((option) => (
                                            <motion.div
                                                key={option.value}
                                                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${formData.branding_display === option.value
                                                    ? 'border-black bg-gray-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleInputChange('branding_display', option.value)}
                                                whileTap={{ scale: 0.995 }}
                                            >
                                                <div className="flex items-center p-5 space-x-4">
                                                    {/* Radio Button */}
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${formData.branding_display === option.value
                                                        ? 'border-black bg-black'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {formData.branding_display === option.value && (
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <span className="text-lg">{option.icon}</span>
                                                            <span className="font-medium text-gray-900 tracking-wide">
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 font-light">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Preview Section */}
                                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 tracking-wide">Preview</h4>
                                            <span className="text-xs text-gray-500 font-light">How it will appear</span>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[60px] flex items-center">
                                            {(formData.branding_display === 'logo' || formData.branding_display === 'both') && formData.logo_url ? (
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={formData.logo_url}
                                                            alt="Logo preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {(formData.branding_display === 'both') && (
                                                        <span className="font-medium text-gray-900 text-lg tracking-wide">
                                                            {formData.restaurant_name || 'Restaurant Name'}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : formData.branding_display === 'text' || formData.branding_display === 'both' ? (
                                                <span className="font-medium text-gray-900 text-lg tracking-wide">
                                                    {formData.restaurant_name || 'Restaurant Name'}
                                                </span>
                                            ) : (
                                                <div className="flex items-center space-x-2 text-gray-400">
                                                    <span className="text-sm italic">Upload a logo to see preview</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Theme Colors Tab */}
                    {activeTab === 'theme' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-3 tracking-wide">
                                    Quick Presets
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {colorPresets.map((preset) => (
                                        <motion.button
                                            key={preset.name}
                                            onClick={() => applyColorPreset(preset)}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-sm hover:border-black transition-colors group"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex gap-1">
                                                <div
                                                    className="w-3 h-3 rounded-sm border border-gray-200"
                                                    style={{ backgroundColor: preset.primary }}
                                                />
                                                <div
                                                    className="w-3 h-3 rounded-sm border border-gray-200"
                                                    style={{ backgroundColor: preset.secondary }}
                                                />
                                                <div
                                                    className="w-3 h-3 rounded-sm border border-gray-200"
                                                    style={{ backgroundColor: preset.accent }}
                                                />
                                            </div>
                                            <span className="text-xs font-light text-gray-700 tracking-wide group-hover:text-black transition-colors">{preset.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                        Primary Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.primary_color}
                                            onChange={(e) => handleInputChange('primary_color', e.target.value)}
                                            className="w-12 h-12 border border-gray-300 rounded-sm cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primary_color}
                                            onChange={(e) => handleInputChange('primary_color', e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-sm text-sm font-mono focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                        Secondary Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.secondary_color}
                                            onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                                            className="w-12 h-12 border border-gray-300 rounded-sm cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.secondary_color}
                                            onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-sm text-sm font-mono focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                        Accent Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.accent_color}
                                            onChange={(e) => handleInputChange('accent_color', e.target.value)}
                                            className="w-12 h-12 border border-gray-300 rounded-sm cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.accent_color}
                                            onChange={(e) => handleInputChange('accent_color', e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-sm text-sm font-mono focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                        Text Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.text_color}
                                            onChange={(e) => handleInputChange('text_color', e.target.value)}
                                            className="w-12 h-12 border border-gray-300 rounded-sm cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.text_color}
                                            onChange={(e) => handleInputChange('text_color', e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-sm text-sm font-mono focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Color Preview */}
                            <div className="p-4 border border-gray-200 rounded-sm bg-gray-50">
                                <h3 className="text-sm font-light text-gray-900 mb-3 tracking-wide">Preview</h3>
                                <div className="flex flex-col gap-3">
                                    <button
                                        className="w-full py-3 rounded-sm text-white font-light tracking-wide"
                                        style={{
                                            backgroundColor: formData.primary_color,
                                            color: 'white'
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className="w-full py-3 rounded-sm border font-light tracking-wide bg-white"
                                        style={{
                                            borderColor: formData.primary_color,
                                            color: formData.primary_color,
                                        }}
                                    >
                                        View Menu
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Contact Information Tab */}
                    {activeTab === 'contact' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors text-gray-900 bg-white"
                                    placeholder="contact@restaurant.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-light text-gray-900 mb-2 tracking-wide">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors text-gray-900 bg-white resize-none"
                                    placeholder="Enter restaurant address"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Fixed Save Button */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-sm font-light tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                        whileTap={{ scale: 0.98 }}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </motion.button>
                </div>
            </div>
        </AdminLayout>
    )
}

export default withAuth(RestaurantSettingsPage, 'settings')
