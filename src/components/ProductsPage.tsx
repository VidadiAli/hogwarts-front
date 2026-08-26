import React from "react";
import Filter from "../models/filters/Filter";
import Products from "../models/products/Products";
import "./ProductsPage.css";
import type { FilterProps } from "../types/TotalTypes";

const ProductsPage: React.FC<FilterProps> = ({filter, setFilter}) => {
  return (
    <div className="user-page-wrapper">
      <div className="user-page-glow-top"></div>
      <div className="user-page-glow-bottom"></div>
      <div className="user-page-container">
        <aside className="user-sidebar-section">
          <Filter filter={filter} setFilter={setFilter}/>
        </aside>
        <main className="user-main-content">
          <Products filter={filter} setFilter={setFilter}/>
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;