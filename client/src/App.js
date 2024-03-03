import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS file for styling

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('name'); // Default search type
  const [sortBy, setSortBy] = useState('created_at'); // Default sort by
  const [sortOrder, setSortOrder] = useState('asc'); // Default sort order
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`/customers?sort=${sortBy}&order=${sortOrder}&page=${currentPage}`);
        setCustomers(response.data.data);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage, sortBy, sortOrder]);

  const handleSort = (key) => {
    setSortBy(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = async (value) => {
    try {
      const response = await axios.get(`/customers/search?${searchType}=${value}`);
      setCustomers(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Customer Table</h2>
      <div className="search">
        <input
          type="text"
          placeholder={`Search by ${searchType === 'name' ? 'name' : 'location'}...`}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="name">Name</option>
          <option value="location">Location</option>
        </select>
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button key={index + 1} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('sno')}>S.No</th>
            <th onClick={() => handleSort('customer_name')}>Customer Name</th>
            <th onClick={() => handleSort('age')}>Age</th>
            <th onClick={() => handleSort('phone')}>Phone</th>
            <th onClick={() => handleSort('location')}>Location</th>
            <th onClick={() => handleSort('created_at')}>Date</th>
            <th onClick={() => handleSort('created_at')}>Time</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={index}>
              <td>{customer.sno}</td>
              <td>{customer.customer_name}</td>
              <td>{customer.age}</td>
              <td>{customer.phone}</td>
              <td>{customer.location}</td>
              <td>{new Date(customer.created_at).toLocaleDateString()}</td>
              <td>{new Date(customer.created_at).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
