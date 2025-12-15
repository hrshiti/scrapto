import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaRupeeSign, FaSave, FaUpload, FaDownload, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { DEFAULT_PRICE_FEED } from '../../shared/utils/priceFeedUtils';

const PriceFeedEditor = () => {
  const [prices, setPrices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = () => {
    // Load prices from localStorage or use shared defaults
    const storedPrices = localStorage.getItem('adminPriceFeed');
    if (storedPrices) {
      setPrices(JSON.parse(storedPrices));
    } else {
      const nowIso = new Date().toISOString();
      const defaultPrices = DEFAULT_PRICE_FEED.map((p) => ({
        ...p,
        effectiveDate: p.effectiveDate || nowIso,
        updatedAt: p.updatedAt || nowIso
      }));
      setPrices(defaultPrices);
      localStorage.setItem('adminPriceFeed', JSON.stringify(defaultPrices));
    }
  };

  const handleEdit = (price) => {
    setEditingId(price.id);
    setEditValue(price.pricePerKg.toString());
  };

  const handleSave = (id) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const updatedPrices = prices.map(price =>
        price.id === id
          ? { ...price, pricePerKg: newPrice, updatedAt: new Date().toISOString() }
          : price
      );
      setPrices(updatedPrices);
      localStorage.setItem('adminPriceFeed', JSON.stringify(updatedPrices));
      setEditingId(null);
      setEditValue('');
      setIsSaving(false);
    }, 500);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleBulkSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('adminPriceFeed', JSON.stringify(prices));
      setIsSaving(false);
      alert('All prices saved successfully!');
    }, 500);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Category', 'Price per Kg (₹)', 'Region', 'Effective Date'],
      ...prices.map(p => [
        p.category,
        p.pricePerKg,
        p.region,
        new Date(p.effectiveDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-feed-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Simple CSV parser (in production, use a proper CSV library)
      const importedPrices = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',');
          const category = values[0]?.trim();
          const price = parseFloat(values[1]?.trim());
          
          if (category && !isNaN(price)) {
            const existingPrice = prices.find(p => p.category === category);
            if (existingPrice) {
              importedPrices.push({
                ...existingPrice,
                pricePerKg: price,
                updatedAt: new Date().toISOString()
              });
            } else {
              importedPrices.push({
                id: `price_${Date.now()}_${i}`,
                category,
                pricePerKg: price,
                region: values[2]?.trim() || 'All',
                effectiveDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }
        }
      }

      if (importedPrices.length > 0) {
        setPrices(importedPrices);
        localStorage.setItem('adminPriceFeed', JSON.stringify(importedPrices));
        alert(`Successfully imported ${importedPrices.length} prices!`);
        setShowCSVModal(false);
      } else {
        alert('No valid prices found in CSV file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#2d3748' }}>
              Price Feed Management
            </h1>
            <p className="text-xs md:text-sm lg:text-base" style={{ color: '#718096' }}>
              Manage scrap category prices per kilogram
            </p>
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all"
              style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
            >
              <FaDownload className="text-xs md:text-sm" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCSVModal(true)}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all"
              style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
            >
              <FaUpload className="text-xs md:text-sm" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBulkSave}
              disabled={isSaving}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
            >
              <FaSave className="text-xs md:text-sm" />
              <span className="hidden sm:inline">Save All</span>
              <span className="sm:hidden">Save</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Price Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f7fafc' }}>
              <tr>
                <th className="px-2 py-2 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                  Category
                </th>
                <th className="px-2 py-2 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                  <span className="hidden sm:inline">Price per Kg (₹)</span>
                  <span className="sm:hidden">Price (₹)</span>
                </th>
                <th className="px-2 py-2 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold hidden md:table-cell" style={{ color: '#2d3748' }}>
                  Region
                </th>
                <th className="px-2 py-2 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold hidden lg:table-cell" style={{ color: '#2d3748' }}>
                  Last Updated
                </th>
                <th className="px-2 py-2 md:px-6 md:py-4 text-center text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price, index) => (
                <motion.tr
                  key={price.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="border-b" style={{ borderColor: '#e2e8f0' }}
                >
                  <td className="px-2 py-2 md:px-6 md:py-4">
                    <span className="font-semibold text-xs md:text-sm" style={{ color: '#2d3748' }}>{price.category}</span>
                  </td>
                  <td className="px-2 py-2 md:px-6 md:py-4">
                    {editingId === price.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                          style={{
                            borderColor: '#e2e8f0',
                            focusBorderColor: '#64946e',
                            focusRingColor: '#64946e'
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(price.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ backgroundColor: '#d1fae5', color: '#10b981' }}
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 rounded-lg transition-all"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaRupeeSign style={{ color: '#64946e' }} />
                        <span className="font-semibold" style={{ color: '#2d3748' }}>
                          {price.pricePerKg}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 md:px-6 md:py-4 hidden md:table-cell">
                    <span className="text-xs md:text-sm" style={{ color: '#718096' }}>{price.region}</span>
                  </td>
                  <td className="px-2 py-2 md:px-6 md:py-4 hidden lg:table-cell">
                    <span className="text-xs md:text-sm" style={{ color: '#718096' }}>
                      {new Date(price.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-2 py-2 md:px-6 md:py-4 text-center">
                    {editingId !== price.id && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(price)}
                        className="p-1.5 md:p-2 rounded-lg transition-all"
                        style={{ backgroundColor: '#f7fafc', color: '#64946e' }}
                      >
                        <FaEdit className="text-xs md:text-sm" />
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* CSV Import Modal */}
      {showCSVModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCSVModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
              Import Prices from CSV
            </h2>
            <p className="text-sm mb-4" style={{ color: '#718096' }}>
              Upload a CSV file with columns: Category, Price per Kg, Region, Effective Date
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="w-full px-4 py-3 rounded-xl border-2 mb-4"
              style={{ borderColor: '#e2e8f0' }}
            />
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCSVModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PriceFeedEditor;

