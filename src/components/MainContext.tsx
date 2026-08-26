import { Route, Routes } from "react-router-dom"
import Home from "./Home"
import type { filterAndData } from "../types/TotalTypes"
import Product from "../models/products/Product"
import Basket from "../models/basket/Basket"
import Order from "../models/orders/Order"

const MainContext: React.FC<filterAndData> = ({ filter, setFilter, profile, setProfile}) => {
  return (
    <div>
      <Routes>
        <Route path="" element={<Home filter={filter} setFilter={setFilter} />} />
        <Route path="basket" element={<Basket profile={profile} setProfile={setProfile}/>} />
        <Route path="orders" element={<Order/>} />
        <Route path="product/:id/:name" element={<Product />} />
      </Routes>
    </div>
  )
}

export default MainContext