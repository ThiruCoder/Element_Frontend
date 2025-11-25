import axios from 'axios'
import React, { useState } from 'react'
import { API_BASE } from '../App'

const InventoryTable = ({ items, loadItems, TotalCount }) => {

    const [editingItems, setEditingItems] = useState([])
    const [isEditMode, setIsEditMode] = useState(false)

    // Delete item
    const deleteItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await axios.delete(`${API_BASE}/items/${id}`)
                if (response.data.success) {
                    loadItems()
                }
            } catch (error) {
                console.error('Error deleting item:', error)
            }
        }
    }

    // Enter edit mode
    const enterEditMode = () => {
        setEditingItems([...items])
        setIsEditMode(true)
    }

    // Cancel edit mode
    const cancelEditMode = () => {
        setEditingItems([])
        setIsEditMode(false)
    }
    // Save all edits
    const saveAllEdits = async () => {
        try {
            const updatePromises = editingItems.map(item =>
                axios.put(`${API_BASE}/items/${item.id}`, {
                    item_name: item.item_name,
                    quantity: item.quantity,
                    per_unit_price: item.per_unit_price
                })
            )

            await Promise.all(updatePromises)
            setIsEditMode(false)
            setEditingItems([])
            loadItems()
        } catch (error) {
            console.error('Error saving edits:', error)
        }
    }
    // Update item in edit mode
    const updateEditItem = (index, field, value) => {
        const updatedItems = [...editingItems]
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'quantity' ? parseInt(value) || 0 :
                field === 'per_unit_price' ? parseFloat(value) || 0 : value
        }

        // Recalculate total price
        if (field === 'quantity' || field === 'per_unit_price') {
            updatedItems[index].total_price =
                updatedItems[index].quantity * updatedItems[index].per_unit_price
        }

        setEditingItems(updatedItems)
    }
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    📋 Inventory Items
                </h2>
                {!isEditMode ? (
                    <button
                        onClick={enterEditMode}
                        className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                    >
                        ✏️ Edit Items
                    </button>
                ) : (
                    <div className="space-x-2">
                        <button
                            onClick={saveAllEdits}
                            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        >
                            💾 Save All
                        </button>
                        <button
                            onClick={cancelEditMode}
                            className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                        >
                            ❌ Cancel
                        </button>
                    </div>
                )}
            </div>

            {isEditMode ? (
                /* Edit Mode View */
                <div className="space-y-4">
                    {editingItems.map((item, index) => (
                        <div key={item.id} className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
                            <h3 className="font-semibold text-lg mb-3">{item.item_name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Item Name
                                    </label>
                                    <input
                                        type="text"
                                        value={item.item_name}
                                        onChange={(e) => updateEditItem(index, 'item_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateEditItem(index, 'quantity', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.per_unit_price}
                                        onChange={(e) => updateEditItem(index, 'per_unit_price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Price
                                    </label>
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md">
                                        ₹{parseFloat(item.total_price)?.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Read Mode View */
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Price (₹)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Price</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        No items found. Add some items to get started!
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={`${item.id}-${item.item_name}`} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.item_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            ₹ {item?.per_unit_price ? parseFloat(item.per_unit_price).toFixed(2) : "0.00"}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            ₹ {item?.total_price ? parseFloat(item.total_price).toFixed(2) : "0.00"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 text-xs"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {items.length === 0 ? null :
                                TotalCount.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-300 bg-gray-200 mt-4 font-bold">
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.label}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.alround_quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            ₹ {item?.alround_unit_price ? parseFloat(item.alround_unit_price).toFixed(2) : "0.00"}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            ₹ {item?.alround_total_price ? parseFloat(item.alround_total_price).toFixed(2) : "0.00"}
                                        </td>
                                        <td></td>
                                    </tr>
                                ))
                            }
                            <tr>
                                <td colSpan="5" className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                                    Total Items: {items.length}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default InventoryTable