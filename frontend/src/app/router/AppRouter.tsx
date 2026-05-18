import { BrowserRouter, Routes, Route} from "react-router-dom"
import  Home from "./LandingPage"
import { LoginPage } from "./LoginPage"
import Onboarding from "@/pages/onboarding/Onboarding"
import Success from "@/pages/onboarding/Success"





 function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/success" element={<Success />} />
      </Routes>


    </BrowserRouter>
  )
}


export default AppRouter