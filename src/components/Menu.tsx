import { useState } from "react";
import Category from "../models/categories/Category"
import { Navbar } from "../models/navbar/Navbar"
import type { FilterAndData } from "../types/TotalTypes"
import './Menu.css'


const Menu: React.FC<FilterAndData> = ({ profile, setProfile, filter, setFilter }) => {
  const [showCategory, setShowCategory] = useState<boolean>(false);
  const categoryClass = "user-categories-container-show";
  return (
    <div className="menu">
      <Navbar profile={profile} setProfile={setProfile} setShowCategory={setShowCategory} filter={filter} setFilter={setFilter} />
      <Category categoryClass={categoryClass} showCategory={showCategory} filter={filter} setFilter={setFilter}/>
    </div>
  )
}

export default Menu