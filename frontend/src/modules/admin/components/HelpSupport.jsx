import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadTickets, updateTicketStatus, TICKET_STATUS } from '../../shared/utils/helpSupportUtils';

const statusLabels = {
  [TICKET_STATUS.OPEN]: 'Open',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.RESOLVED]: 'Resolved'
};

const statusColors = {
  [TICKET_STATUS.OPEN]: '#f97316',
  [TICKET_STATUS.IN_PROGRESS]: '#3b82f6',
  [TICKET_STATUS.RESOLVED]: '#16a34a'
};

const HelpSupportAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    setTickets(loadTickets());
  }, []);

  const handleStatusChange = (ticketId, newStatus) => {
    const updated = updateTicketStatus(ticketId, newStatus);
    setTickets(updated);
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterRole !== 'all' && t.role !== filterRole) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
            <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2" style={{ color: '#2d3748' }}>
              Help & Support Tickets
            </h1>
            <p className="text-xs md:text-sm" style={{ color: '#718096' }}>
              View and manage support requests from users and scrappers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs md:text-sm"
              style={{ borderColor: '#e2e8f0', color: '#2d3748' }}
            >
              <option value="all">All roles</option>
              <option value="user">Users</option>
              <option value="scrapper">Scrappers</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs md:text-sm"
              style={{ borderColor: '#e2e8f0', color: '#2d3748' }}
            >
              <option value="all">All statuses</option>
              <option value={TICKET_STATUS.OPEN}>Open</option>
              <option value={TICKET_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TICKET_STATUS.RESOLVED}>Resolved</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Ticket List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden"
      >
        {filteredTickets.length === 0 ? (
          <div className="p-6 md:p-10 text-center">
            <p className="text-sm md:text-base font-semibold mb-1" style={{ color: '#2d3748' }}>
              No support tickets found
            </p>
            <p className="text-xs md:text-sm" style={{ color: '#718096' }}>
              New user or scrapper issues will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#e2e8f0' }}>
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 md:p-4 lg:p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold uppercase"
                        style={{
                          backgroundColor: ticket.role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                          color: ticket.role === 'user' ? '#1d4ed8' : '#6d28d9'
                        }}
                      >
                        {ticket.role === 'user' ? 'User' : 'Scrapper'}
                      </span>
                      <span className="text-[10px] md:text-xs" style={{ color: '#718096' }}>
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm mb-1" style={{ color: '#2d3748' }}>
                      <span className="font-semibold">{ticket.name}</span>
                      {ticket.phone && (
                        <span style={{ color: '#718096' }}> • {ticket.phone}</span>
                      )}
                    </p>
                    <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>
                      Category: <span className="font-medium" style={{ color: '#2d3748' }}>{ticket.category}</span>
                    </p>
                    <p className="text-xs md:text-sm whitespace-pre-wrap" style={{ color: '#4a5568' }}>
                      {ticket.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold"
                      style={{
                        backgroundColor: `${statusColors[ticket.status]}20`,
                        color: statusColors[ticket.status]
                      }}
                    >
                      {statusLabels[ticket.status]}
                    </span>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {ticket.status !== TICKET_STATUS.OPEN && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(ticket.id, TICKET_STATUS.OPEN)}
                          className="px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold border"
                          style={{ borderColor: '#e2e8f0', color: '#4a5568' }}
                        >
                          Mark Open
                        </button>
                      )}
                      {ticket.status !== TICKET_STATUS.IN_PROGRESS && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(ticket.id, TICKET_STATUS.IN_PROGRESS)}
                          className="px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold border"
                          style={{ borderColor: '#bfdbfe', color: '#1d4ed8' }}
                        >
                          In Progress
                        </button>
                      )}
                      {ticket.status !== TICKET_STATUS.RESOLVED && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(ticket.id, TICKET_STATUS.RESOLVED)}
                          className="px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold border"
                          style={{ borderColor: '#bbf7d0', color: '#166534' }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HelpSupportAdmin;


