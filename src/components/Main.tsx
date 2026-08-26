import type { filterAndData } from "../types/TotalTypes"
import Menu from "./Menu"
import MainContext from './MainContext'

const Main: React.FC<filterAndData> = ({ profile, setProfile, filter, setFilter }) => {
  return (
    <div>
        <Menu profile={profile} setProfile={setProfile} filter={filter} setFilter={setFilter} />
        <MainContext filter={filter} setFilter={setFilter} profile={profile} setProfile={setProfile}/>
    </div>
  )
}

export default Main