import { Route, Routes } from "react-router-dom"
import Navbar from "../models/admin/navbar/Navbar"
import Products from "../models/admin/products/Products"
import Categories from "../models/admin/categories/Categories"
import Properties from "../models/admin/properties/Properties"
import Users from "../models/admin/users/Users"

const AdminRouters = () => {
  return (
    <div>
        <Navbar />
        <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/features" element={<Properties />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/users" element={<Users />} />
        </Routes>
    </div>
  )
}

export default AdminRouters