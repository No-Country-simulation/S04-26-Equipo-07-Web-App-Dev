import { BrowserRouter, Routes, Route} from "react-router-dom"
import  Home from "./LandingPage"
import { LoginPage } from "./LoginPage"





 function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
      </Routes>


    </BrowserRouter>
  )
}


export default AppRouter