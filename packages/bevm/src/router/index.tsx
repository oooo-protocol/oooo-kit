import HomePage from '@/pages/home'
import CheckoutPage from '@/pages/checkout'
import HistoryPage from '@/pages/history'

const routes = [
  {
    path: '/',
    element: <HomePage />
  }, {
    path: '/checkout',
    element: <CheckoutPage />
  }, {
    path: '/history',
    element: <HistoryPage />
  }
]

export default routes
