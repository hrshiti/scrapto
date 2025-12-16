import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import plasticImage from '../assets/plastic.jpg';
import metalImage from '../assets/metal.jpg';
import scrapImage2 from '../assets/scrab.png';
import electronicImage from '../assets/electronicbg.png';

const AllCategoriesPage = () => {
  const navigate = useNavigate();

  const allCategories = [
    { 
      name: 'Plastic', 
      image: plasticImage,
      description: 'All types of plastic materials'
    },
    { 
      name: 'Metal', 
      image: metalImage,
      description: 'Iron, steel, and other metals'
    },
    { 
      name: 'Paper', 
      image: scrapImage2,
      description: 'Newspapers, cardboard, books'
    },
    { 
      name: 'Electronics', 
      image: electronicImage,
      description: 'E-waste and electronic items'
    },
    { 
      name: 'Copper', 
      image: metalImage,
      description: 'Copper wires and pipes'
    },
    { 
      name: 'Aluminium', 
      image: metalImage,
      description: 'Aluminium cans and sheets'
    },
    { 
      name: 'Brass', 
      image: metalImage,
      description: 'Brass items and fittings'
    },
    { 
      name: 'Steel', 
      image: metalImage,
      description: 'Steel rods and sheets'
    },
    { 
      name: 'Glass', 
      image: scrapImage2,
      description: 'Glass bottles and containers'
    },
    { 
      name: 'Textile', 
      image: scrapImage2,
      description: 'Old clothes and fabrics'
    },
    { 
      name: 'Wood', 
      image: scrapImage2,
      description: 'Wooden furniture and items'
    },
    { 
      name: 'Rubber', 
      image: plasticImage,
      description: 'Tires and rubber products'
    },
  ];

  const handleCategoryClick = (category) => {
    // Navigate to category selection page
    navigate('/add-scrap/category', { 
      state: { preSelectedCategory: category.name } 
    });
  };

  return (
    <div 
      className="min-h-screen w-full relative z-0 pb-20 md:pb-0 overflow-x-hidden"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-40 px-4 md:px-6 lg:px-8 py-4 md:py-6" style={{ backgroundColor: '#f4ebe2' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ color: '#64946e', backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 
              className="text-xl md:text-2xl font-bold"
              style={{ color: '#2d3748' }}
            >
              All Categories
            </h1>
            <p 
              className="text-sm md:text-base mt-0.5"
              style={{ color: '#718096' }}
            >
              Browse all available scrap categories
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
          {allCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category)}
              className="cursor-pointer"
            >
              <div 
                className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    style={{ display: 'block' }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p 
                    className="text-base md:text-lg font-semibold text-center mb-1"
                    style={{ color: '#2d3748' }}
                  >
                    {category.name}
                  </p>
                  <p 
                    className="text-xs md:text-sm text-center"
                    style={{ color: '#718096' }}
                  >
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCategoriesPage;

