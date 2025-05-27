
import React, { useState } from 'react';
import { FaFileAlt, FaQuestionCircle, FaPaperPlane } from 'react-icons/fa';

// Mock notifications hook
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  read: boolean;
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'Excel data loaded successfully.', type: 'success', read: true },
    { id: '2', message: 'PDF export completed.', type: 'success', read: false },
  ]);
  const [loading, setLoading] = useState(false);

  const addNotification = (message: string, type: Notification['type']) => {
    setNotifications((prev) => [
      ...prev,
      { id: Date.now().toString(), message, type, read: false },
    ]);
  };

  return { notifications, loading, addNotification };
};

// Contact form state
interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Help: React.FC = () => {
  const { notifications, loading: notificationsLoading, addNotification } = useNotifications();
  const [contact, setContact] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name || !contact.email || !contact.subject || !contact.message) {
      addNotification('Please fill in all fields before sending your message.', 'warning');
      return;
    }
    setSending(true);
    try {
      await new Promise((res) => setTimeout(res, 1200)); // Simulate API call
      addNotification('Your message has been sent! Our support team will contact you soon.', 'success');
      setContact({ name: '', email: '', subject: '', message: '' });
    } catch {
      addNotification('Failed to send your message. Please try again later.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen space-y-6">
      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Notifications</h2>
        {notificationsLoading ? (
          <div className="text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications at this time.</div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-center">
                <span
                  className={`mr-2 font-medium ${
                    n.type === 'error'
                      ? 'text-red-600'
                      : n.type === 'success'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {n.type.toUpperCase()}:
                </span>
                <span>{n.message}</span>
                <span className="ml-2 text-xs text-gray-400">
                  {n.read ? '(Read)' : '(Unread)'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Help & Support</h2>
        <p className="text-gray-700">
          Welcome to the Meru Sales Ltd. Oil Dispatch System help center. This system helps you manage
          pending oil orders, track dispatches, and generate reports. Learn how to add, edit, and
          delete orders, filter data, and export PDF reports for your business needs.
        </p>
      </div>

      {/* Documentation and FAQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
            <FaFileAlt size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Documentation</h3>
          <p className="text-gray-600 mb-4">
            Explore our detailed guides on managing oil dispatch orders, including how to add orders,
            edit quantities, and export reports.
          </p>
          <button
            onClick={() => window.open('https://merusales.co.ke/docs', '_blank')}
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
          >
            View Documentation
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
            <FaQuestionCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">FAQs</h3>
          <p className="text-gray-600 mb-4">
            Find answers to common questions about entering orders, filtering by date, and generating
            PDF reports.
          </p>
          <button
            onClick={() => window.open('https://merusales.co.ke/faq', '_blank')}
            className="border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-50"
          >
            View FAQs
          </button>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Support</h2>
        <form className="space-y-4" onSubmit={handleContactSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={contact.name}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={contact.email}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={contact.subject}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
              placeholder="What is your question about?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={contact.message}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 min-h-[120px]"
              placeholder="Please describe your issue or question in detail"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                sending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaPaperPlane className="mr-2" />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      {/* Video Tutorials */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Adding and Editing Orders */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 h-40">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Adding and Editing Orders"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-40"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-1">Adding and Editing Orders</h4>
              <p className="text-sm text-gray-600">
                Learn how to add new pending orders and edit quantities for products like 20L and 10L.
              </p>
            </div>
          </div>
          {/* Filtering and Searching Orders */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 h-40">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Filtering and Searching Orders"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-40"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-1">Filtering and Searching Orders</h4>
              <p className="text-sm text-gray-600">
                Understand how to filter orders by date and search by customer or S.O. number.
              </p>
            </div>
          </div>
          {/* Exporting PDF Reports */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 h-40">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Exporting PDF Reports"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-40"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-1">Exporting PDF Reports</h4>
              <p className="text-sm text-gray-600">
                See how to generate and download PDF reports for pending orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;