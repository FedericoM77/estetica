import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BookingPage } from './pages/BookingPage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
