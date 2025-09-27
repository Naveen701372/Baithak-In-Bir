import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order items with menu item inventory requirements
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items!inner (
          menu_item_inventory (
            inventory_item_id,
            quantity_required
          )
        )
      `)
      .eq('order_id', orderId)

    if (orderError) {
      console.error('Error fetching order items:', orderError)
      return NextResponse.json(
        { error: 'Failed to fetch order items' },
        { status: 500 }
      )
    }

    // Calculate total inventory deductions needed
    const inventoryDeductions: { [key: string]: number } = {}

    orderItems?.forEach((orderItem: any) => {
      const menuItemInventory = orderItem.menu_items.menu_item_inventory
      
      menuItemInventory?.forEach((requirement: any) => {
        const totalRequired = requirement.quantity_required * orderItem.quantity
        
        if (inventoryDeductions[requirement.inventory_item_id]) {
          inventoryDeductions[requirement.inventory_item_id] += totalRequired
        } else {
          inventoryDeductions[requirement.inventory_item_id] = totalRequired
        }
      })
    })

    // Check if we have enough stock for all items
    const inventoryItemIds = Object.keys(inventoryDeductions)
    
    if (inventoryItemIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No inventory deductions needed' })
    }

    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('id, name, current_stock')
      .in('id', inventoryItemIds)

    if (inventoryError) {
      console.error('Error fetching inventory items:', inventoryError)
      return NextResponse.json(
        { error: 'Failed to fetch inventory items' },
        { status: 500 }
      )
    }

    // Check for insufficient stock
    const insufficientStock: string[] = []
    
    inventoryItems?.forEach(item => {
      const requiredQuantity = inventoryDeductions[item.id]
      if (item.current_stock < requiredQuantity) {
        insufficientStock.push(`${item.name} (need ${requiredQuantity}, have ${item.current_stock})`)
      }
    })

    if (insufficientStock.length > 0) {
      return NextResponse.json(
        { 
          error: 'Insufficient stock',
          details: insufficientStock
        },
        { status: 400 }
      )
    }

    // Perform inventory deductions
    const deductionPromises = inventoryItems?.map(item => {
      const deductionAmount = inventoryDeductions[item.id]
      const newStock = item.current_stock - deductionAmount

      return supabase
        .from('inventory_items')
        .update({ current_stock: newStock })
        .eq('id', item.id)
    })

    if (deductionPromises) {
      const results = await Promise.all(deductionPromises)
      
      // Check if any deductions failed
      const failedDeductions = results.filter(result => result.error)
      
      if (failedDeductions.length > 0) {
        console.error('Some inventory deductions failed:', failedDeductions)
        return NextResponse.json(
          { error: 'Some inventory deductions failed' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Inventory deducted successfully',
      deductions: inventoryDeductions
    })

  } catch (error) {
    console.error('Error in inventory deduction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}