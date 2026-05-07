import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
export const products = [{
  id: "1",
  name: "Royal Diamond Necklace",
  price: 245000,
  weight: 18.5,
  purity: "22K",
  rating: 4.8,
  category: "Gold",
  image: product1,
  description: "Exquisite 22K gold necklace with diamond accents, handcrafted by master artisans.",
  vendor: "Tanishq",
  valueScore: 92,
  stock: 5
}, {
  id: "2",
  name: "Solitaire Gold Ring",
  price: 85000,
  weight: 6.2,
  purity: "18K",
  rating: 4.5,
  category: "Gold",
  image: product2,
  description: "Elegant solitaire ring in 18K gold with brilliant cut diamond.",
  vendor: "Kalyan",
  valueScore: 87,
  stock: 12
}, {
  id: "3",
  name: "Classic Gold Bangle",
  price: 120000,
  weight: 22.0,
  purity: "22K",
  rating: 4.7,
  category: "Gold",
  image: product3,
  description: "Traditional 22K gold bangle with intricate filigree work.",
  vendor: "Joyalukkas",
  valueScore: 89,
  stock: 8
}, {
  id: "4",
  name: "Diamond Stud Earrings",
  price: 175000,
  weight: 4.5,
  purity: "18K",
  rating: 4.9,
  category: "Diamond",
  image: product4,
  description: "Premium diamond studs set in 18K white gold.",
  vendor: "Malabar Gold",
  valueScore: 94,
  stock: 3
}, {
  id: "5",
  name: "Gold Pendant Chain",
  price: 65000,
  weight: 8.0,
  purity: "22K",
  rating: 4.3,
  category: "Gold",
  image: product5,
  description: "Simple yet elegant 22K gold pendant with matching chain.",
  vendor: "Tanishq",
  valueScore: 82,
  stock: 15
}, {
  id: "6",
  name: "Silver Anklet",
  price: 12000,
  weight: 15.0,
  purity: "925 Silver",
  rating: 4.1,
  category: "Silver",
  image: product6,
  description: "Sterling silver anklet with delicate chain links.",
  vendor: "Kalyan",
  valueScore: 78,
  stock: 20
}];
export const categories = ["All", "Gold", "Silver", "Diamond", "22K", "18K"];
export const vendorStats = {
  totalSales: 1250000,
  totalOrders: 48,
  totalProducts: 24,
  monthlySales: [{
    month: "Jan",
    sales: 180000
  }, {
    month: "Feb",
    sales: 220000
  }, {
    month: "Mar",
    sales: 150000
  }, {
    month: "Apr",
    sales: 280000
  }, {
    month: "May",
    sales: 200000
  }, {
    month: "Jun",
    sales: 320000
  }]
};
export const adminStats = {
  totalUsers: 1250,
  totalVendors: 45,
  totalProducts: 890,
  totalOrders: 3200,
  totalRevenue: 45000000,
  platformData: [{
    month: "Jan",
    users: 800,
    orders: 400,
    revenue: 5000000
  }, {
    month: "Feb",
    users: 900,
    orders: 450,
    revenue: 5500000
  }, {
    month: "Mar",
    users: 950,
    orders: 500,
    revenue: 6000000
  }, {
    month: "Apr",
    users: 1050,
    orders: 580,
    revenue: 7200000
  }, {
    month: "May",
    users: 1150,
    orders: 620,
    revenue: 8000000
  }, {
    month: "Jun",
    users: 1250,
    orders: 650,
    revenue: 8500000
  }]
};
