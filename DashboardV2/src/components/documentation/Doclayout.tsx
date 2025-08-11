import { Outlet } from 'react-router-dom'
import NavDoc from './NavDoc'

const Doclayout = () => {
  return (
    <>
      <NavDoc />
      <Outlet />
    </>
  )
}

export default Doclayout
