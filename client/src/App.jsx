import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const addUser = async (e) => {
    e.preventDefault()
    if (!name) return
    
    setLoading(true)
    try {
      await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      setName('')
      fetchUsers()
    } catch (error) {
      console.error('Error adding user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>User Directory</h1>
      
      <form onSubmit={addUser}>
        <div className="form-group">
          <label htmlFor="name">Add New User</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter user name..."
            autoComplete="off"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </form>

      <ul className="user-list">
        {users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>No users found.</p>
        ) : (
          users.map((user) => (
            <li key={user._id} className="user-item">
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-id">ID: {user._id}</div>
              </div>
              <div style={{ color: '#10b981', fontSize: '1.25rem' }}>●</div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default App
