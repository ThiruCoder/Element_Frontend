import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import InventoryTable from './Components/InventoryTable'

export const API_BASE = process.env.API_BASE || 'https://element-backend-co6b.onrender.com'

function App() {
  const [items, setItems] = useState([])
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 1,
    per_unit_price: null
  })

  // Load items on component mount
  useEffect(() => {
    loadItems()
  }, [])

  // Load all items from API
  const loadItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/items`)
      if (response.data.success) {
        setItems(response.data.data)
      }
    } catch (error) {
      console.error('Error loading items:', error)
    }
  }

  // Add new item
  const addItem = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE}/addItems`, formData)
      if (response.data.success) {
        setFormData({ item_name: '', quantity: 1, per_unit_price: 0 })
        loadItems()
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const TotalCount = [
    {
      label: 'Total',
      alround_total_price: items.reduce((sum, item) => sum + parseFloat(item.total_price), 0),
      alround_unit_price: items.reduce((sum, item) => sum + parseFloat(item.per_unit_price), 0),
      alround_quantity: items.reduce((sum, item) => sum + parseFloat(item.quantity), 0),
    }
  ]
  // console.log('TotalCount', items, TotalCount);
  // Apply coupon code
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code')
      return
    }

    try {
      const response = await axios.get(`${API_BASE}/discount/${couponCode}`);
      if (response.data.success) {
        setDiscount(response.data.data.discount_percentage);
        console.log('discount', response.data);
      } else {
        alert(response.data.error || 'Invalid coupon');
        setDiscount(0);
      }
    } catch (error) {
      setDiscount(0)
      console.log(error);

    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0)
  const discountAmount = subtotal * (discount / 100)
  const totalToPay = subtotal - discountAmount

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📦 Inventory Management System
          </h1>
          <p className="text-lg text-gray-600">
            Manage your inventory with ease
          </p>
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ➕ Add New Item
          </h2>
          <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.per_unit_price}
                placeholder='0'
                onChange={(e) => {
                  const value = e.target.value;
                  if (!/^\d*\.?\d*$/.test(value)) return;
                  setFormData({ ...formData, per_unit_price: value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>

        {/* Inventory Table */}
        <InventoryTable items={items} loadItems={loadItems} TotalCount={TotalCount} />

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🧾 Order Summary
          </h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold">₹{parseFloat(subtotal).toFixed(2)}</span>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={applyCoupon}
                className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              >
                Apply Coupon
              </button>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-700">Discount ({discount}%):</span>
                <span className="font-semibold text-red-600">
                  -₹{parseFloat(discountAmount).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-t border-gray-300">
              <span className="text-lg font-bold text-gray-900">Total to Pay:</span>
              <span className="text-xl font-bold text-green-600">
                ₹{totalToPay ? parseFloat(totalToPay).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App