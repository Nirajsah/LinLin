import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './output.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MarketPlace from './components/MarketPlace'
import UserProvider from './context/UserProvider'
import { ApolloProvider } from '@apollo/client'
import { createApolloClient } from './GraphQL/Url'
import Navbar from './components/Navbar'
import { Toaster } from 'sonner'

const client = createApolloClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <div className="font-changa min-h-screen bg-[#1a1c1f] text-white">
      <BrowserRouter>
        <UserProvider>
          <Toaster />
          <Navbar />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/marketplace" element={<MarketPlace />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </div>
  </ApolloProvider>
)
