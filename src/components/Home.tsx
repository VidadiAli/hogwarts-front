import type React from "react"
import ProductsPage from "./ProductsPage"
import type { FilterProps } from "../types/TotalTypes"

const Home: React.FC<FilterProps> = ({filter, setFilter}) => {
  return (
    <div>
        <ProductsPage filter={filter} setFilter={setFilter}/>
    </div>
  )
}

export default Home