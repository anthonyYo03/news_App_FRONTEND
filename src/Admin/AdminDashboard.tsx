import { useNavigate } from 'react-router-dom'
import { handleLogout } from '../Logout/Logout';
import GetUser from './AdminFunctionalities/GetUser';
import './AdminDashboard.css';
export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={() => handleLogout(navigate)}>Logout</button>
      </div>
      <GetUser/>
      <button 
        className="create-user-fab"
        onClick={() => navigate('/createUser')}
        title="Create a new user"
      >
        +
      </button>
    </>
  )
}
 