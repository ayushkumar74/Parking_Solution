import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchBookingHistory();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://parking-solution.onrender.com/api/parking', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userBookings = response.data.filter(
        spot => spot.bookedBy && (spot.bookedBy._id === user?._id || spot.bookedBy._id === user?.id)
      );
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://parking-solution.onrender.com/api/parking/history/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingHistory(response.data);
    } catch (error) {
      console.error('Error fetching booking history:', error);
    }
  };

  const activeBookings = bookingHistory
    .filter(h => h.status === 'active')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const completedBookings = bookingHistory
    .filter(h => h.status === 'completed' || h.status === 'cancelled' || h.status === 'released')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleBookingAction = async (spotId, action, bookingId) => {
    if (action === 'cancelled') {
      const confirmMessage = 'Are you sure you want to cancel this booking?';
      if (!window.confirm(confirmMessage)) return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://parking-solution.onrender.com/api/parking/${spotId}/release`,
        {
          status: action,
          bookingId: bookingId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      fetchBookingHistory();
      alert(`Booking ${action === 'cancelled' ? 'cancelled' : 'completed'} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating booking');
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900 text-black dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Profile
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and view your bookings</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user?.name || 'User'}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-3">{user?.email}</p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-semibold">
                  {user?.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                </span>
                <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold">
                  ✅ Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Active Bookings</p>
                <p className="text-4xl font-bold">{activeBookings.length}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Active Spots</p>
                <p className="text-4xl font-bold">{activeBookings.reduce((sum, spot) => sum + (spot.bookedSpots || 1), 0)}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🅿️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Spending</p>
                <p className="text-4xl font-bold">₹{completedBookings.reduce((sum, spot) => spot.status !== 'cancelled' ? sum + (spot.totalAmount || 0) : sum, 0).toFixed(0)}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* Active Bookings Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Active Bookings</h2>
          </div>

          {activeBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">You don't have any active bookings yet.</p>
              <Link to="/parking" className="mt-4 inline-block text-blue-600 font-bold">Book a spot now →</Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeBookings.map((booking) => (
                <div key={booking._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{booking.parkingSpotName}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <p className="text-sm">📍 <strong>Location:</strong> {booking.location}</p>
                        <p className="text-sm">🅿️ <strong>Spots:</strong> {booking.bookedSpots || 1}</p>
                        <p className="text-sm">🕐 <strong>From:</strong> {new Date(booking.bookedAt).toLocaleString()}</p>
                        <p className="text-sm">⏰ <strong>Until:</strong> {new Date(booking.bookedUntil).toLocaleString()}</p>
                      </div>
                      {booking.entryCode && (
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl inline-block border border-purple-200">
                          <span className="text-purple-800 dark:text-purple-200 font-bold tracking-widest">ENTRY CODE: {booking.entryCode}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <button 
                        onClick={() => handleBookingAction(booking.parkingSpotId?._id || booking.parkingSpotId, 'completed', booking._id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
                      >
                        Complete
                      </button>
                      <button 
                        onClick={() => handleBookingAction(booking.parkingSpotId?._id || booking.parkingSpotId, 'cancelled', booking._id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-xl">
          <h2 className="text-3xl font-bold mb-6">Booking History</h2>
          {completedBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No booking history yet.</div>
          ) : (
            <div className="grid gap-4">
              {completedBookings.map((booking) => (
                <div key={booking._id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-wrap justify-between items-center border border-gray-100 dark:border-gray-700">
                  <div className="flex-1">
                    <p className="font-bold text-lg">{booking.parkingSpotName}</p>
                    <p className="text-xs text-gray-500">📍 {booking.location} | 📅 {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">₹{booking.totalAmount}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${booking.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;