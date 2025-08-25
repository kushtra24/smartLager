import { defineStore } from 'pinia'
import axiosClient from '@/axiosClient'
import { useStorage } from '@vueuse/core'
import type { RemovableRef } from '@vueuse/core'

interface Product {
  id: number
  name: string
  type: string
  description: string
  price: string
  // Add other product properties as needed
}

interface Client {
  id: number
  companyName: string
  vatNumber: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  contactPerson: string
  // Add other client properties as needed
}

interface ShipmentProduct {
  name: string
  description: string
  price: number
  volume: number
  unitPrice: number
}

interface Invoice {
  invoiceNumber: string
  date: Date
  dueDate: Date
  taxRate: number
  status: string
  notes: string
}

interface ShipmentState {
  selectedProduct: RemovableRef<Product | null>
  editablePrice: RemovableRef<number | null>
  editableVolume: RemovableRef<number>
  totalPrice: RemovableRef<number>
  addedProducts: RemovableRef<ShipmentProduct[]>
  allProducts: Product[]
  loading: boolean
  selectedClient: RemovableRef<Client | null>
  allClients: Client[]
  loadingClient: boolean
  invoice: RemovableRef<Invoice>
}

export const useShipmentStore = defineStore('shipment', {
  state: (): ShipmentState => ({
    selectedProduct: useStorage('shipment-selectedProduct', null),
    editablePrice: useStorage('shipment-editablePrice', null),
    editableVolume: useStorage('shipment-editableVolume', 1),
    totalPrice: useStorage('shipment-totalPrice', 0),
    addedProducts: useStorage('shipment-addedProducts', []),
    allProducts: [],
    loading: true,
    selectedClient: useStorage('shipment-selectedClient', null),
    allClients: [],
    loadingClient: false,
    invoice: useStorage('shipment-invoice', {
      invoiceNumber: generateInvoiceNumber(),
      date: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
      taxRate: 7.7, // Default Swiss VAT
      status: 'pending',
      notes: ''
    })
  }),

  getters: {
    invoiceStatusOptions: () => [
      { label: 'Pending', value: 'pending' },
      { label: 'In Shipment', value: 'inShipment' },
      { label: 'Shipped', value: 'shipped' },
      { label: 'Delivered', value: 'delivered' }
    ],
    
    totalWithTax(): number {
      return this.calculateTotalWithTax()
    },
    
    totalAmount(): number {
      return this.calculateGrandTotal()
    },
    
    payload(): unknown {
      return {
        client: this.selectedClient,
        products: this.addedProducts,
        invoice: {
          invoice_number: this.invoice.invoiceNumber,
          date: this.invoice.date,
          due_date: this.invoice.dueDate,
          subtotal: this.totalAmount,
          tax_rate: this.invoice.taxRate,
          tax_amount: this.totalAmount * (this.invoice.taxRate / 100),
          total: this.totalWithTax,
          status: this.invoice.status,
          notes: this.invoice.notes,
        }
      }
    }
  },

  actions: {
    // Calculate total with tax
    calculateTotalWithTax(): number {
      const subtotal = this.calculateGrandTotal()
      const taxAmount = subtotal * (this.invoice.taxRate / 100)
      return subtotal + taxAmount
    },

    // Calculate grand total
    calculateGrandTotal(): number {
      return this.addedProducts.reduce((total, product) => total + product.price, 0)
    },

    // Generate invoice number (YYYY-MM-XXXXX format)
    generateInvoiceNumber(): string {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const random = Math.floor(10000 + Math.random() * 90000) // 5-digit random number
      return `${year}-${month}-${random}`
    },

    // Fetch products from API
    async fetchProducts() {
      this.loading = true
      try {
        const response = await axiosClient.get('api/shipementSelectProducts')
        this.allProducts = response.data
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    // Fetch clients
    async searchClients(query: string) {
      this.loadingClient = true
      try {
        const response = await axiosClient.get(`api/getClientByName?query=${query}`)
        this.allClients = response.data
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        this.loadingClient = false
      }
    },

    // Save shipment to API
    async saveShipment() {
      try {
        await axiosClient.post('api/shipments', this.payload)
        return { success: true, message: 'Shipment saved successfully!' }
      } catch (error) {
        console.error('Error saving shipment:', error)
        return { success: false, message: 'Failed to save shipment.', error }
      }
    },

    // Update total price based on volume and unit price
    updateTotalPrice() {
      if (this.editablePrice !== null && this.editableVolume > 0) {
        this.totalPrice = this.editablePrice * this.editableVolume
      } else {
        this.totalPrice = 0
      }
    },

    // Watch product selection
    setSelectedProduct(product: Product | null) {
      this.selectedProduct = product
      if (product && product.price) {
        // Remove euro sign and parse float
        const priceNum = parseFloat(product.price.replace(/[^\d.]/g, ''))
        this.editablePrice = isNaN(priceNum) ? null : priceNum
        // Reset volume to 1 when product changes
        this.editableVolume = 1
        // Update total price
        this.updateTotalPrice()
      } else {
        this.editablePrice = null
        this.totalPrice = 0
      }
    },

    // Add product to shipment
    addProduct() {
      if (
        !this.selectedProduct ||
        this.editablePrice === null ||
        this.editablePrice === undefined ||
        this.editablePrice < 0 ||
        this.editableVolume <= 0
      ) {
        return { success: false, message: 'Please enter valid price and volume values.' }
      }

      this.addedProducts.push({
        name: this.selectedProduct.name,
        description: this.selectedProduct.description,
        price: this.totalPrice,
        volume: this.editableVolume,
        unitPrice: this.editablePrice
      })

      this.selectedProduct = null
      this.editablePrice = null
      this.editableVolume = 1
      this.totalPrice = 0
      
      return { success: true }
    },

    // Remove product from shipment
    removeProduct(idx: number) {
      this.addedProducts.splice(idx, 1)
    },

    // Increment volume
    incrementVolume() {
      this.editableVolume++
      this.updateTotalPrice()
    },

    // Decrement volume
    decrementVolume() {
      if (this.editableVolume > 1) {
        this.editableVolume--
        this.updateTotalPrice()
      }
    },
    
    // Reset state
    resetState() {
      this.selectedProduct = null
      this.editablePrice = null
      this.editableVolume = 1
      this.totalPrice = 0
      this.addedProducts = []
      this.selectedClient = null
      this.invoice = {
        invoiceNumber: this.generateInvoiceNumber(),
        date: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        taxRate: 7.7,
        status: 'pending',
        notes: ''
      }
    },
    
    // Create a new shipment, which resets the state
    newShipment() {
      this.resetState()
      // Clear the stored values in localStorage
      localStorage.removeItem('shipment-selectedProduct')
      localStorage.removeItem('shipment-editablePrice')
      localStorage.removeItem('shipment-editableVolume')
      localStorage.removeItem('shipment-totalPrice')
      localStorage.removeItem('shipment-addedProducts')
      localStorage.removeItem('shipment-selectedClient')
      localStorage.removeItem('shipment-invoice')
    }
  }
})

// Helper function to generate invoice number (outside of store to avoid this binding issues)
function generateInvoiceNumber(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(10000 + Math.random() * 90000) // 5-digit random number
  return `${year}-${month}-${random}`
}
