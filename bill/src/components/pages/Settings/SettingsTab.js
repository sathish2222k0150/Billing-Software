import React from 'react';
import { Sun, Moon, Book, MessageSquare, Mail } from 'lucide-react';

export const BusinessProfileTab = ({ settings, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Business Profile</h3>
    <div className="grid gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
        <input
          type="text"
          name="businessName"
          value={settings.businessName}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Address</label>
        <textarea
          name="businessAddress"
          value={settings.businessAddress}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={settings.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
);

export const BillingTab = ({ settings, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Billing & Invoicing</h3>
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
          <select
            name="currency"
            value={settings.currency}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax ID</label>
          <input
            type="text"
            name="taxId"
            value={settings.taxId}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invoice Prefix</label>
        <input
          type="text"
          name="invoicePrefix"
          value={settings.invoicePrefix}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>
);

export const ShippingTab = ({ settings, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Shipping Settings</h3>
    <div className="grid gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Shipping Method</label>
        <select
          name="shippingMethod"
          value={settings.shippingMethod}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="standard">Standard Shipping</option>
          <option value="express">Express Shipping</option>
          <option value="pickup">Store Pickup</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Origin</label>
        <textarea
          name="shippingOrigin"
          value={settings.shippingOrigin}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="freeShippingEnabled"
          checked={settings.freeShippingEnabled}
          onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Enable Free Shipping Threshold</label>
      </div>
      {settings.freeShippingEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Free Shipping Minimum Order</label>
          <input
            type="number"
            name="freeShippingThreshold"
            value={settings.freeShippingThreshold}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  </div>
);

export const LegalTab = ({ settings, handleChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Legal & Compliance</h3>
    <div className="grid gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Terms & Conditions</label>
        <textarea
          name="termsConditions"
          value={settings.termsConditions}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="6"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Privacy Policy</label>
        <textarea
          name="privacyPolicy"
          value={settings.privacyPolicy}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="6"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="gdprCompliance"
          checked={settings.gdprCompliance}
          onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked } })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Enable GDPR Compliance</label>
      </div>
    </div>
  </div>
);

export const AppearanceTab = ({ settings, handleChange, setSettings }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Appearance</h3>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Theme</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
            className={`flex items-center justify-center p-4 rounded-lg border ${
              settings.theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Sun className="h-6 w-6 mr-2" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
            className={`flex items-center justify-center p-4 rounded-lg border ${
              settings.theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Moon className="h-6 w-6 mr-2" />
            Dark
          </button>
          <button
            type="button"
            onClick={() => setSettings(prev => ({ ...prev, theme: 'system' }))}
            className={`flex items-center justify-center p-4 rounded-lg border ${
              settings.theme === 'system'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center">
              <Sun className="h-6 w-6 mr-1" />
              <Moon className="h-6 w-6 ml-1" />
            </div>
            <span className="ml-2">System</span>
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
        <select
          name="fontSize"
          value={settings.fontSize}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dashboard Density</label>
        <select
          name="dashboardDensity"
          value={settings.dashboardDensity}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>
    </div>
  </div>
);

export const HelpTab = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Help & Support</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center mb-4">
          <Book className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Documentation</h4>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Browse our comprehensive documentation to learn more about features and best practices.</p>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">View Documentation →</button>
      </div>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Contact Support</h4>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Contact Us →</button>
      </div>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center mb-4">
          <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Email Us</h4>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Send us an email and we'll get back to you as soon as possible.</p>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Email Support →</button>
      </div>
    </div>
  </div>
);

export const TeamTab = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Team Management</h3>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">Team Members</h4>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Member
        </button>
      </div>
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">John Doe</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">john@example.com</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Admin</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">Edit</button>
                <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const SecurityTab = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-4 border-b dark:border-gray-700">Security</h3>
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Password Requirements</h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireStrongPasswords"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requireStrongPasswords" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Require strong passwords
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="passwordExpiration"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="passwordExpiration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable password expiration (90 days)
            </label>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enable2FA"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enable2FA" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Require 2FA for all users
            </label>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Session Management</h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inactiveTimeout"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="inactiveTimeout" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Automatic logout after 30 minutes of inactivity
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);