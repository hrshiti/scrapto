import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaClock } from 'react-icons/fa';

const ServiceSchedulePage = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [preferredTime, setPreferredTime] = useState('');

    useEffect(() => {
        // Guard
        if (!sessionStorage.getItem('serviceDetails') || !sessionStorage.getItem('addressData')) {
            navigate('/categories');
        }
    }, [navigate]);

    const getNextDays = (count = 7) => {
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < count; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const iso = date.toISOString().split('T')[0];
            const dayName = dayNames[date.getDay()];
            const display = `${dayName}, ${date.getDate()}`;
            days.push({ iso, dayName, display });
        }
        return days;
    };

    const timeSlots = [
        '9:00 AM - 11:00 AM',
        '11:00 AM - 1:00 PM',
        '1:00 PM - 3:00 PM',
        '3:00 PM - 5:00 PM',
        '5:00 PM - 7:00 PM'
    ];

    const dayOptions = getNextDays(7);

    const handleContinue = () => {
        if (!selectedDate || !selectedSlot) {
            alert('Please select a date and time slot.');
            return;
        }

        const dateObj = new Date(selectedDate);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dateObj.getDay()];

        const pickupSlot = {
            date: selectedDate,
            dayName: dayName,
            slot: selectedSlot,
            timestamp: Date.now()
        };

        sessionStorage.setItem('pickupSlot', JSON.stringify(pickupSlot));
        navigate('/book-service/confirm');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen w-full flex flex-col bg-[#f4ebe2]"
        >
            <div className="flex items-center gap-4 p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Schedule Service</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                    <h2 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-green-600" /> Select Date
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {dayOptions.map((day) => (
                            <button
                                key={day.iso}
                                onClick={() => setSelectedDate(day.iso)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all border-2 ${selectedDate === day.iso
                                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                                        : 'bg-transparent text-green-700 border-green-100/50 hover:bg-green-50'
                                    }`}
                            >
                                {day.display}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                        <FaClock className="text-green-600" /> Select Time
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all border-2 ${selectedSlot === slot
                                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                                        : 'bg-transparent text-green-700 border-green-100/50 hover:bg-green-50'
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <button
                    onClick={handleContinue}
                    disabled={!selectedDate || !selectedSlot}
                    className="w-full py-3 rounded-xl font-bold text-white shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: '#22c55e' }}
                >
                    Continue to Summary
                </button>
            </div>
        </motion.div>
    );
};

export default ServiceSchedulePage;
