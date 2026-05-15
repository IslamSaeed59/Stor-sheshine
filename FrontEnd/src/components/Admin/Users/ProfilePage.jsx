import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserById } from "../../../Services/api";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  Edit,
  Heart,
  ShoppingBag,
  Star,
  CreditCard,
  Gift,
  Award,
  Clock,
} from "lucide-react";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinaryParams";

const ProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for cosmetics store
  const mockOrderHistory = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      total: 89.99,
      status: "Delivered",
      items: [
        { name: "Velvet Matte Lipstick - Ruby Woo", quantity: 2 },
        { name: "Hydrating Foundation - Ivory", quantity: 1 },
      ],
    },
    {
      id: "ORD-002",
      date: "2024-02-01",
      total: 145.5,
      status: "Processing",
      items: [
        { name: "Rose Gold Eyeshadow Palette", quantity: 1 },
        { name: "Volumizing Mascara", quantity: 2 },
        { name: "Setting Spray", quantity: 1 },
      ],
    },
  ];

  const mockWishlist = [
    {
      id: 1,
      name: "Limited Edition Highlighter",
      brand: "Glow Cosmetics",
      price: 34.99,
      image:
        "https://images.unsplash.com/photo-1596704017254-9b121068fb31?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: 2,
      name: "Silk Lipstick Set",
      brand: "Luxe Beauty",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
  ];

  const mockReviews = [
    {
      id: 1,
      product: "Hydrating Foundation",
      rating: 5,
      comment: "Amazing coverage and feels light on skin!",
      date: "2024-01-20",
    },
    {
      id: 2,
      product: "Matte Lipstick",
      rating: 4,
      comment: "Long-lasting but slightly drying",
      date: "2024-01-25",
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUserById(id);
        setUser(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch user data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-zinc-100 text-black";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your beauty profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-rose-50">
        <div className="text-center text-red-500 bg-white p-8 rounded-xl shadow-lg">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-rose-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-xl text-gray-600">User not found.</p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-gray-400 via-rose-400 to-purple-400"></div>
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <img
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                  src={`https://i.pravatar.cc/150?u=${user.email}`}
                  alt={`${user.name}'s avatar`}
                />
                <div className="absolute bottom-0 right-0 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <span>@{user.email.split("@")[0]}</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <Award size={16} className="text-gray-800" />
                    Beauty Insider
                  </span>
                </p>
              </div>
              <Link
                to={`/admin/profiles/update/${user.id}`}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-black hover:to-rose-700 transition-all transform hover:scale-105 shadow-md"
              >
                <Edit size={18} />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ShoppingBag size={20} className="text-gray-900" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Heart size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Wishlist</p>
                <p className="text-xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["overview", "orders", "wishlist", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize transition-colors relative ${
                    activeTab === tab
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                  {tab === "wishlist" && (
                    <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <User size={20} className="text-gray-800" />
                  Contact Information
                </h2>
                <InfoItem
                  icon={<Mail size={18} />}
                  label="Email"
                  value={user.email}
                />
                <InfoItem
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={user.phone}
                />
                <InfoItem
                  icon={<MapPin size={18} />}
                  label="Shipping Address"
                  value={
                    user.profile?.Address ||
                    "123 Beauty Lane, Makeup City, MC 12345"
                  }
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <Calendar size={20} className="text-gray-800" />
                  Account Details
                </h2>
                <InfoItem
                  icon={<User size={18} />}
                  label="Member Since"
                  value={formatDate(user.createdAt)}
                />
                <InfoItem
                  icon={<Calendar size={18} />}
                  label="Date of Birth"
                  value={formatDate(user.profile?.DOB) || "-"}
                />
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order History
              </h2>
              <div className="space-y-4">
                {mockOrderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {order.id}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatDate(order.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                        <span className="font-bold text-gray-900">
                          ${order.total}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name} (x{item.items})
                          {idx < order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                    <button className="mt-2 text-gray-900 text-sm hover:text-black font-medium">
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                My Wishlist
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockWishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 border rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={optimizeCloudinaryUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.brand}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-gray-900">
                          ${item.price}
                        </span>
                        <button className="text-gray-900 hover:text-black text-sm font-medium">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                My Reviews
              </h2>
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.product}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
    <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-800 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-md font-medium text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

export default ProfilePage;
