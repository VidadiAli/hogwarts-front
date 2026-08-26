import { Route, Routes } from 'react-router-dom'
import './App.css'
import Main from './components/Main'
import AdminRouters from './routers/AdminRouters'
import { useState } from 'react'
import { type FilterType, type ProfileType } from './types/TotalTypes'

const App = () => {
  const filterData = {
    categoryId: null,
    name: "",
    minPrice: null,
    maxPrice: null,
    hasDelivery: null,
    hasDiscount: null
  }
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [filter, setFilter] = useState<FilterType>(filterData)

  return (
    <div>
      <Routes>
        <Route path="/admin/*" element={<AdminRouters />} />
        <Route path="/*" element={<Main profile={profile} setProfile={setProfile} filter={filter} setFilter={setFilter} />} />
      </Routes>
    </div>
  )
}

export default App