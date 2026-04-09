import { ToastContainer } from 'react-toastify'

export default function NotificationToast() {
  return (
    <ToastContainer
      position="top-end"
      autoClose={3500}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  )
}
