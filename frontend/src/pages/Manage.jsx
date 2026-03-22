import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Manage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth(); // AuthContext se loading bhi nikalo
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    // SECURITY CHECK: Agar loading khatam ho gayi aur banda admin nahi hai
    if (!authLoading && !isAdmin) {
      console.log("Access Denied: Not an admin");
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [spotsRes, usersRes, bookingsRes] = await Promise.all([
        axios.get('https://parking-solution.onrender.com/api/parking', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://parking-solution.onrender.com/api/user/all', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get('https://parking-solution.onrender.com/api/parking/bookings/all', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      setSpots(spotsRes.data || []);
      setUsers(usersRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Pehle Auth check karo (Loading screen)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse font-bold text-2xl">Verifying Admin Access...</div>
      </div>
    );
  }

  // 2. Agar Admin nahi hai, toh render hi mat karo
  if (!isAdmin) {
    return null;
  }

  // 3. Agar Data load ho raha hai (sirf Admins ke liye)
  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Fetching Records...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white p-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        Admin Dashboard
      </h1>
      
      {/* Tera baaki ka UI (Stats, Tabs, etc.) yahan aayega */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
             <p className="text-sm">Total Revenue</p>
             <p className="text-3xl font-bold">₹{bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + (b.totalAmount || 0) : sum, 0).toFixed(2)}</p>
          </div>
          <div className="bg-purple-600 p-6 rounded-2xl text-white shadow-lg">
             <p className="text-sm">Total Bookings</p>
             <p className="text-3xl font-bold">{bookings.length}</p>
          </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
          <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 ${activeTab === 'bookings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>Bookings</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 ${activeTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>Users</button>
      </div>

      {activeTab === 'bookings' && (
          <div className="space-y-4">
              {bookings.map(b => (
                  <div key={b._id} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                      <p className="font-bold">{b.parkingSpotName || 'Spot'}</p>
                      <p className="text-sm text-gray-400">User: {b.userId?.name || 'Deleted User'}</p>
                      <p className="text-sm text-green-500">₹{b.totalAmount}</p>
                  </div>
              ))}
          </div>
      )}

      {activeTab === 'users' && (
          <div className="space-y-4">
              {users.filter(u => u.role !== 'admin').map(u => (
                  <div key={u._id} className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex justify-between">
                      <p>{u.name} ({u.email})</p>
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded">USER</span>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Manage;