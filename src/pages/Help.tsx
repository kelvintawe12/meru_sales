import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { HelpCircleIcon, FileTextIcon, SendIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNotifications } from '../hooks/useNotifications';

export const Help: React.FC = () => {
  // Notifications hook
  const { notifications, loading: notificationsLoading, addNotification } = useNotifications();

  // Contact form state
  const [contact, setContact] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name || !contact.email || !contact.subject || !contact.message) {
      addNotification('Please fill in all fields before sending your message.', 'warning');
      return;
    }
    setSending(true);
    try {
      // Replace with your real API endpoint if needed
      await new Promise(res => setTimeout(res, 1200));
      addNotification('Your message has been sent! Our support team will contact you soon.', 'success');
      setContact({ name: '', email: '', subject: '', message: '' });
    } catch {
      addNotification('Failed to send your message. Please try again later.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <Card title="System Notifications">
        {notificationsLoading ? (
          <div>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications at this time.</div>
        ) : (
          <ul>
            {notifications.map(n => (
              <li key={n.id} className="mb-1">
                <strong className={`mr-2 ${n.type === 'error' ? 'text-red-600' : n.type === 'success' ? 'text-green-600' : n.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {n.type.toUpperCase()}:
                </strong>
                {n.message} {n.read ? <span className="text-xs text-gray-400">(Read)</span> : <span className="text-xs text-blue-400">(Unread)</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Help & Support">
        <div className="prose max-w-none">
          <p className="text-gray-700">
            Welcome to the Refinery Management System help center. Here you can
            find information about using the system, troubleshooting common
            issues, and contacting support.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FileTextIcon size={32} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Documentation</h3>
            <p className="text-gray-600 mb-4">
              Read our comprehensive documentation to learn how to use all
              features of the system.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://your-documentation-link.com', '_blank')}
            >
              View Documentation
            </Button>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <HelpCircleIcon size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">FAQs</h3>
            <p className="text-gray-600 mb-4">
              Find answers to commonly asked questions about the refinery
              management system.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://your-faq-link.com', '_blank')}
            >
              View FAQs
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Contact Support">
        <form className="space-y-4" onSubmit={handleContactSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={contact.name}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={contact.email}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={contact.subject}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]"
              placeholder="What is your question about?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={contact.message}
              onChange={handleContactChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48] min-h-[120px]"
              placeholder="Please describe your issue or question in detail"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button icon={<SendIcon size={18} />} type="submit" isLoading={sending}>
              Send Message
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Video Tutorials">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Refinery Data Entry */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 h-40 flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/vD0kbdIS6kE?si=BOgw6fa-NmuVuKxJ"
                title="Refinery Data Entry"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-40"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="font-medium mb-1">Refinery Data Entry</h4>
              <p className="text-sm text-gray-600">
                Learn how to enter and submit refinery data correctly.
              </p>
            </div>
          </div>
          {/* Fractionation Process */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 h-40 flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/1dvY58yDnes?si=r1Nw8RRbOzyF81ly"
                title="Fractionation Process"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-40"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="font-medium mb-1">Fractionation Process</h4>
              <p className="text-sm text-gray-600">
                Understanding the fractionation form and calculations.
              </p>
            </div>
          </div>
          {/* MTD Reporting */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 h-40 flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/COm8ute0VJs?si=B44iR9yZAXFDakgf"
                title="MTD Reporting"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-40"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="font-medium mb-1">MTD Reporting</h4>
              <p className="text-sm text-gray-600">
                How to generate and interpret monthly reports.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};