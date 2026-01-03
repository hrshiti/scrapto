import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaRupeeSign, FaSave, FaUpload, FaDownload, FaEdit, FaCheck, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { DEFAULT_PRICE_FEED, DEFAULT_SERVICE_FEED, PRICE_TYPES } from '../../shared/utils/priceFeedUtils';
import { adminAPI } from '../../shared/utils/api';
import { usePageTranslation } from '../../../hooks/usePageTranslation';

const PriceFeedEditor = () => {
  const [prices, setPrices] = useState([]);
  const [activeTab, setActiveTab] = useState(PRICE_TYPES.MATERIAL);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({ category: '', price: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const staticTexts = [
    "Please enter a valid price",
    "Price saved successfully!",
    "Failed to save price",
    "Failed to save price. Please try again.",
    "Are you sure you want to delete this category? This action cannot be undone.",
    "Category deleted successfully!",
    "Failed to delete category",
    "Failed to delete category. Please try again.",
    "Category removed!",
    "Please fill in all fields",
    "Service added successfully!",
    "Material added successfully!",
    "Failed to add material",
    "All prices saved successfully!",
    "{count} prices failed to save",
    "Failed to save some prices. Please try again.",
    "Successfully imported {count} prices!",
    "Failed to save some imported prices. Please try again.",
    "No valid prices found in CSV file",
    "Price Feed Management",
    "Manage scrap category prices per kilogram",
    "Add Material",
    "Add",
    "Export CSV",
    "Export",
    "Import CSV",
    "Import",
    "Save All",
    "Save",
    "Scrap Materials",
    "Cleaning Services",
    "Loading prices...",
    "Retry",
    "Category",
    "Service Name",
    "Price per Kg (₹)",
    "Service Fee (₹)",
    "Price",
    "Fee",
    "Region",
    "Last Updated",
    "Actions",
    "Edit price",
    "Delete category",
    "Import Prices from CSV",
    "Upload a CSV file with columns: Category, Price per Kg, Region, Effective Date",
    "Cancel",
    "Add New {type}",
    "Service Name",
    "Category Name",
    "e.g. Garage Cleaning",
    "e.g. Copper Wire",
    "Fixed Fee (₹)",
    "Price per Kg (₹)",
    "e.g. 500",
    "e.g. 450",
    "Adding...",
    "Add Service",
    "Add Material"
  ];
  const { getTranslatedText } = usePageTranslation(staticTexts);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getAllPrices();
      let dbPrices = [];

      if (response.success && response.data?.prices) {
        // Transform backend prices to frontend format
        dbPrices = response.data.prices.map((price) => ({
          id: price._id || price.id,
          category: price.category || 'Unknown',
          pricePerKg: price.pricePerKg || 0,
          region: price.regionCode || price.region || 'IN-DL',
          effectiveDate: price.effectiveDate || price.createdAt || new Date().toISOString(),
          updatedAt: price.updatedAt || price.createdAt || new Date().toISOString()
        }));
      }



      // Use prices directly from DB
      setPrices(dbPrices);
    } catch (err) {
      console.error('Error loading prices:', err);
      // Fallback to defaults on error
      const nowIso = new Date().toISOString();
      const defaultPrices = [
        ...DEFAULT_PRICE_FEED.map((p) => ({ ...p, effectiveDate: nowIso, updatedAt: nowIso, type: PRICE_TYPES.MATERIAL })),
        ...DEFAULT_SERVICE_FEED.map((p) => ({ ...p, effectiveDate: nowIso, updatedAt: nowIso, type: PRICE_TYPES.SERVICE }))
      ];
      setPrices(defaultPrices);
      // Don't show error to user if we have defaults, but maybe log it
      if (err.response?.status !== 404) {
        setError(err.message || getTranslatedText('Failed to load prices'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (price) => {
    setEditingId(price.id);
    // For Material: pricePerKg, For Service: price (flat fee)
    // Actually, backend might store flat fee in pricePerKg for uniformity if I didn't add 'price' field,
    // but I added 'price' field to Price model.
    // Ideally, frontend should check 'price' first, then 'pricePerKg'.
    // NOTE: In current implementation plan, I added 'price' to schemas but 'pricePerKg' is still used for materials.
    // Let's use the appropriate field.
    const val = price.type === PRICE_TYPES.SERVICE ? (price.price || price.pricePerKg) : price.pricePerKg;
    setEditValue(val ? val.toString() : '0');
  };

  const handleSave = async (id) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice < 0) {
      alert(getTranslatedText('Please enter a valid price'));
      return;
    }

    setIsSaving(true);
    try {
      // Find the price to update
      const priceToUpdate = prices.find(p => p.id === id);
      if (!priceToUpdate) {
        throw new Error('Price not found');
      }

      let response;
      // Check if price exists in backend (has _id format) or needs to be created
      if (id && id.startsWith('price_')) {
        // New price, create it
        response = await adminAPI.createPrice({
          category: priceToUpdate.category,
          pricePerKg: priceToUpdate.type === PRICE_TYPES.SERVICE ? 0 : newPrice,
          price: priceToUpdate.type === PRICE_TYPES.SERVICE ? newPrice : 0,
          regionCode: priceToUpdate.region || 'IN-DL',
          effectiveDate: new Date().toISOString(),
          isActive: true,
          type: priceToUpdate.type || PRICE_TYPES.MATERIAL
        });
      } else {
        // Existing price, update it
        response = await adminAPI.updatePrice(id, {
          pricePerKg: priceToUpdate.type === PRICE_TYPES.SERVICE ? 0 : newPrice,
          price: priceToUpdate.type === PRICE_TYPES.SERVICE ? newPrice : 0,
          effectiveDate: new Date().toISOString()
        });
      }

      if (response.success) {
        // Reload prices from backend to get updated data
        await loadPrices();
        setEditingId(null);
        setEditValue('');
        alert(getTranslatedText('Price saved successfully!'));
      } else {
        throw new Error(response.error || response.message || getTranslatedText('Failed to save price'));
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert(error.message || getTranslatedText('Failed to save price. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (id) => {
    // Confirm before deleting
    if (!window.confirm(getTranslatedText('Are you sure you want to delete this category? This action cannot be undone.'))) {
      return;
    }

    setIsSaving(true);
    try {
      // Check if it's a backend price or local-only
      if (id && !id.startsWith('price_')) {
        // Backend price, delete via API
        const response = await adminAPI.deletePrice(id);

        if (response.success) {
          await loadPrices();
          alert(getTranslatedText('Category deleted successfully!'));
        } else {
          throw new Error(response.message || getTranslatedText('Failed to delete category'));
        }
      } else {
        // Local-only price, just remove from state
        setPrices(prevPrices => prevPrices.filter(p => p.id !== id));
        alert(getTranslatedText('Category removed!'));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.message || getTranslatedText('Failed to delete category. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newMaterialData.category || !newMaterialData.price) {
      alert(getTranslatedText('Please fill in all fields'));
      return;
    }

    setIsSaving(true);
    try {
      const response = await adminAPI.createPrice({
        category: newMaterialData.category,
        pricePerKg: activeTab === PRICE_TYPES.MATERIAL ? parseFloat(newMaterialData.price) : 0,
        price: activeTab === PRICE_TYPES.SERVICE ? parseFloat(newMaterialData.price) : 0,
        regionCode: 'IN-DL',
        effectiveDate: new Date().toISOString(),
        isActive: true,
        type: activeTab
        // description: newMaterialData.description // Backend Price model doesn't strictly have description, but we can add it or ignore for now.
        // Actually Price model doesn't have description. I should have added it.
        // For now, I'll ignore description or assume context implied by category name.
      });

      if (response.success) {
        await loadPrices();
        setShowAddModal(false);
        setNewMaterialData({ category: '', price: '', description: '' });
        alert(activeTab === PRICE_TYPES.SERVICE
          ? getTranslatedText('Service added successfully!')
          : getTranslatedText('Material added successfully!'));
      } else {
        throw new Error(response.message || getTranslatedText('Failed to add material'));
      }
    } catch (error) {
      console.error('Error adding material:', error);
      alert(error.message || getTranslatedText('Failed to add material'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkSave = async () => {
    setIsSaving(true);
    try {
      // Save all prices to backend
      const savePromises = prices.map(price => {
        if (price.id && price.id.startsWith('price_')) {
          // New price, create it
          return adminAPI.createPrice({
            category: price.category,
            pricePerKg: price.pricePerKg,
            regionCode: price.region || 'IN-DL',
            effectiveDate: price.effectiveDate || new Date().toISOString(),
            isActive: true
          });
        } else {
          // Existing price, update it
          return adminAPI.updatePrice(price.id, {
            pricePerKg: price.type === PRICE_TYPES.SERVICE ? 0 : (price.pricePerKg || price.price),
            price: price.type === PRICE_TYPES.SERVICE ? (price.price || price.pricePerKg) : 0,
            effectiveDate: price.effectiveDate || new Date().toISOString()
          });
        }
      });

      const results = await Promise.all(savePromises);
      const failed = results.filter(r => !r.success);

      if (failed.length === 0) {
        // Reload prices from backend
        await loadPrices();
        alert(getTranslatedText('All prices saved successfully!'));
      } else {
        throw new Error(getTranslatedText("{count} prices failed to save", { count: failed.length }));
      }
    } catch (error) {
      console.error('Error saving prices:', error);
      alert(error.message || getTranslatedText('Failed to save some prices. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Category', 'Price per Kg (₹)', 'Region', 'Effective Date'],
      ...prices.filter(p => !p.type || p.type === activeTab).map(p => [
        p.category,
        p.type === PRICE_TYPES.SERVICE ? (p.price || p.pricePerKg) : p.pricePerKg,
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
    reader.onload = async (e) => {
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
        // Save imported prices to backend
        const savePromises = importedPrices.map(price => {
          if (price.id && price.id.startsWith('price_')) {
            // New price, create it
            return adminAPI.createPrice({
              category: price.category,
              pricePerKg: price.pricePerKg,
              regionCode: price.region || 'IN-DL',
              effectiveDate: price.effectiveDate || new Date().toISOString(),
              isActive: true
            });
          } else {
            // Existing price, update it
            return adminAPI.updatePrice(price.id, {
              pricePerKg: price.pricePerKg,
              effectiveDate: price.effectiveDate || new Date().toISOString()
            });
          }
        });

        try {
          await Promise.all(savePromises);
          await loadPrices(); // Reload from backend
          alert(getTranslatedText("Successfully imported {count} prices!", { count: importedPrices.length }));
          setShowCSVModal(false);
        } catch (error) {
          console.error('Error saving imported prices:', error);
          alert(getTranslatedText('Failed to save some imported prices. Please try again.'));
        }
      } else {
        alert(getTranslatedText('No valid prices found in CSV file'));
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
              {getTranslatedText("Price Feed Management")}
            </h1>
            <p className="text-xs md:text-sm lg:text-base" style={{ color: '#718096' }}>
              {getTranslatedText("Manage scrap category prices per kilogram")}
            </p>
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
            >
              <FaPlus className="text-xs md:text-sm" />
              <span className="hidden sm:inline">{getTranslatedText("Add Material")}</span>
              <span className="sm:hidden">{getTranslatedText("Add")}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all"
              style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
            >
              <FaDownload className="text-xs md:text-sm" />
              <span className="hidden sm:inline">{getTranslatedText("Export CSV")}</span>
              <span className="sm:hidden">{getTranslatedText("Export")}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCSVModal(true)}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all"
              style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
            >
              <FaUpload className="text-xs md:text-sm" />
              <span className="hidden sm:inline">{getTranslatedText("Import CSV")}</span>
              <span className="sm:hidden">{getTranslatedText("Import")}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBulkSave}
              disabled={isSaving}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all"
              style={{ backgroundColor: '#2d3748', color: '#ffffff' }}
            >
              <FaSave className="text-xs md:text-sm" />
              <span className="hidden sm:inline">{getTranslatedText("Save All")}</span>
              <span className="sm:hidden">{getTranslatedText("Save")}</span>
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab(PRICE_TYPES.MATERIAL)}
            className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${activeTab === PRICE_TYPES.MATERIAL
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {getTranslatedText("Scrap Materials")}
          </button>
          <button
            onClick={() => setActiveTab(PRICE_TYPES.SERVICE)}
            className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${activeTab === PRICE_TYPES.SERVICE
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {getTranslatedText("Cleaning Services")}
          </button>
        </div>
      </motion.div >

      {/* Loading / Error State */}
      {
        loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#64946e' }} />
            <p className="text-sm md:text-base font-semibold" style={{ color: '#2d3748' }}>
              {getTranslatedText("Loading prices...")}
            </p>
          </motion.div>
        )
      }

      {
        error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center"
          >
            <p className="text-sm md:text-base mb-4" style={{ color: '#718096' }}>
              {error}
            </p>
            <button
              onClick={loadPrices}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: '#64946e' }}
            >
              {getTranslatedText("Retry")}
            </button>
          </motion.div>
        )
      }

      {/* Price Table */}
      {
        !loading && !error && (
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
                      {activeTab === PRICE_TYPES.MATERIAL ? getTranslatedText('Category') : getTranslatedText('Service Name')}
                    </th>
                    <th className="px-2 py-2 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                      <span className="hidden sm:inline">{activeTab === PRICE_TYPES.MATERIAL ? getTranslatedText('Price per Kg (₹)') : getTranslatedText('Service Fee (₹)')}</span>
                      <span className="sm:hidden">{activeTab === PRICE_TYPES.MATERIAL ? getTranslatedText('Price') : getTranslatedText('Fee')}</span>
                    </th>
                    <th className="px-2 py-2 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold hidden md:table-cell" style={{ color: '#2d3748' }}>
                      {getTranslatedText("Region")}
                    </th>
                    <th className="px-2 py-2 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold hidden lg:table-cell" style={{ color: '#2d3748' }}>
                      {getTranslatedText("Last Updated")}
                    </th>
                    <th className="px-2 py-2 md:px-6 md:py-4 text-center text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                      {getTranslatedText("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prices.filter(p => activeTab === PRICE_TYPES.SERVICE ? p.type === PRICE_TYPES.SERVICE : (!p.type || p.type === PRICE_TYPES.MATERIAL)).map((price, index) => (
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
                              {price.type === PRICE_TYPES.SERVICE ? (price.price || price.pricePerKg) : price.pricePerKg}
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
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(price)}
                              className="p-1.5 md:p-2 rounded-lg transition-all"
                              style={{ backgroundColor: '#f7fafc', color: '#64946e' }}
                              title={getTranslatedText("Edit price")}
                            >
                              <FaEdit className="text-xs md:text-sm" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(price.id)}
                              className="p-1.5 md:p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                              title={getTranslatedText("Delete category")}
                              disabled={isSaving}
                            >
                              <FaTrash className="text-xs md:text-sm" />
                            </motion.button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )
      }

      {/* CSV Import Modal */}
      {
        showCSVModal && (
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
                {getTranslatedText("Import Prices from CSV")}
              </h2>
              <p className="text-sm mb-4" style={{ color: '#718096' }}>
                {getTranslatedText("Upload a CSV file with columns: Category, Price per Kg, Region, Effective Date")}
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
                  {getTranslatedText("Cancel")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )
      }

      {/* Add Material Modal */}
      {
        showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
                {getTranslatedText("Add New {type}", { type: activeTab === PRICE_TYPES.SERVICE ? getTranslatedText('Service') : getTranslatedText('Material') })}
              </h2>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#4a5568' }}>
                    {activeTab === PRICE_TYPES.SERVICE ? getTranslatedText('Service Name') : getTranslatedText('Category Name')}
                  </label>
                  <input
                    type="text"
                    value={newMaterialData.category}
                    onChange={(e) => setNewMaterialData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder={activeTab === PRICE_TYPES.SERVICE ? getTranslatedText("e.g. Garage Cleaning") : getTranslatedText("e.g. Copper Wire")}
                    className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ borderColor: '#e2e8f0', focusRingColor: '#64946e' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#4a5568' }}>
                    {activeTab === PRICE_TYPES.SERVICE ? getTranslatedText('Fixed Fee (₹)') : getTranslatedText('Price per Kg (₹)')}
                  </label>
                  <input
                    type="number"
                    value={newMaterialData.price}
                    onChange={(e) => setNewMaterialData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder={activeTab === PRICE_TYPES.SERVICE ? getTranslatedText("e.g. 500") : getTranslatedText("e.g. 450")}
                    className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ borderColor: '#e2e8f0', focusRingColor: '#64946e' }}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all"
                    style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
                  >
                    {getTranslatedText("Cancel")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 rounded-xl font-semibold text-white transition-all shadow-md"
                    style={{ backgroundColor: '#64946e' }}
                  >
                    {isSaving ? getTranslatedText('Adding...') : (activeTab === PRICE_TYPES.SERVICE ? getTranslatedText('Add Service') : getTranslatedText('Add Material'))}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )
      }
    </div >
  );
};


export default PriceFeedEditor;

