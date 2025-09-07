import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">SmartClass</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors">
                Admin Portal
              </Link>
              <Link to="/student" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Student Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Classroom &
            <span className="text-indigo-600"> Timetable Scheduler</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionize your educational institution with AI-powered timetable optimization. 
            Maximize resource utilization, minimize conflicts, and create the perfect schedule for everyone.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/admin" className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
              Admin Portal
            </Link>
            <Link to="/student" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors">
              View Student Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600">Everything you need for optimal scheduling</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">AI-powered optimization considering faculty availability, room capacity, and student preferences.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Resource Optimization</h3>
              <p className="text-gray-600">Maximize classroom and laboratory utilization while ensuring optimal learning environments.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Stakeholder</h3>
              <p className="text-gray-600">Seamless coordination between students, faculty, and administrative staff.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SmartClass?</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Solve Complex Scheduling Challenges</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700"><strong>Real-time Faculty Availability:</strong> Account for leaves and preferences</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700"><strong>Room Capacity Optimization:</strong> Match class sizes with room capabilities</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700"><strong>Workload Balance:</strong> Ensure fair distribution of teaching hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700"><strong>Multi-Department Support:</strong> Handle complex multi-shift scenarios</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Parameters We Handle:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Number of classrooms and laboratories</li>
                <li>• Student batch sizes and requirements</li>
                <li>• Subject combinations and frequencies</li>
                <li>• Faculty availability and expertise</li>
                <li>• Special fixed time slots</li>
                <li>• Room equipment requirements</li>
                <li>• Multi-department coordination</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">SmartClass Timetable Scheduler</h3>
            <p className="text-gray-400 mb-6">Empowering educational institutions with intelligent scheduling solutions</p>
            <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 mr-4">Admin Portal</Link>
            <Link to="/student" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Access Student Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Student Portal Component
const StudentPortal = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timetable');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${API}/batches`);
      setBatches(response.data);
      if (response.data.length > 0) {
        setSelectedBatch(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchTimetable = async (batchId) => {
    if (!batchId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/student/timetable/${batchId}`);
      setTimetable(response.data.timetable || []);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setTimetable([]);
    }
    setLoading(false);
  };

  const fetchAssignments = async (batchId) => {
    if (!batchId) return;
    
    try {
      const response = await axios.get(`${API}/assignments/batch/${batchId}`);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    }
  };

  useEffect(() => {
    if (selectedBatch) {
      fetchTimetable(selectedBatch);
      fetchAssignments(selectedBatch);
    }
  }, [selectedBatch]);

  const groupTimetableByDay = (timetableData) => {
    const grouped = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach(day => {
      grouped[day] = timetableData
        .filter(entry => entry.day === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    
    return grouped;
  };

  const selectedBatchInfo = batches.find(b => b.id === selectedBatch);
  const groupedTimetable = groupTimetableByDay(timetable);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">SmartClass</Link>
              <span className="ml-4 text-gray-600">Student Portal</span>
            </div>
            <Link to="/" className="text-indigo-600 hover:text-indigo-800">← Back to Home</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Batch Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Batch</h2>
          <div className="flex flex-wrap gap-4">
            {batches.map((batch) => (
              <button
                key={batch.id}
                onClick={() => setSelectedBatch(batch.id)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedBatch === batch.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {batch.name} - {batch.department} (Sem {batch.semester})
              </button>
            ))}
          </div>
          
          {selectedBatchInfo && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold text-indigo-900">Batch Information</h3>
              <p className="text-indigo-800">
                {selectedBatchInfo.name} • {selectedBatchInfo.department} • 
                Semester {selectedBatchInfo.semester} • {selectedBatchInfo.student_count} Students
              </p>
            </div>
          )}
        </div>

        {selectedBatch && (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'timetable'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📅 Timetable
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'assignments'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📝 Assignments
                  </button>
                  <button
                    onClick={() => setActiveTab('faculty')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'faculty'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👨‍🏫 Faculty & Rooms
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Timetable Tab */}
                {activeTab === 'timetable' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Timetable</h3>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : timetable.length > 0 ? (
                      <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                          {Object.entries(groupedTimetable).map(([day, dayClasses]) => (
                            <div key={day} className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-3 text-center">{day}</h4>
                              <div className="space-y-2">
                                {dayClasses.length > 0 ? (
                                  dayClasses.map((classItem, index) => (
                                    <div key={index} className="bg-white rounded p-3 border-l-4 border-indigo-500">
                                      <div className="text-sm font-medium text-gray-900">
                                        {classItem.subject_code}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {classItem.start_time} - {classItem.end_time}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {classItem.faculty_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        📍 {classItem.room_name}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center text-gray-500 text-sm py-4">
                                    No classes scheduled
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No timetable available. Please contact administration.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Assignments</h3>
                    {assignments.length > 0 ? (
                      <div className="space-y-4">
                        {assignments.map((assignment) => (
                          <div key={assignment.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                              <span className="text-sm text-gray-500">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{assignment.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>📚 {assignment.subject_name} ({assignment.subject_code})</span>
                              <span>👨‍🏫 {assignment.faculty_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No assignments available.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Faculty & Rooms Tab */}
                {activeTab === 'faculty' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Faculty & Room Information</h3>
                    
                    {timetable.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Faculty Info */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Faculty</h4>
                          <div className="space-y-3">
                            {[...new Map(timetable.map(item => [item.faculty_id, item])).values()].map((item) => (
                              <div key={item.faculty_id} className="bg-white border rounded-lg p-4">
                                <h5 className="font-medium text-gray-900">{item.faculty_name}</h5>
                                <p className="text-sm text-gray-600">
                                  Teaching: {[...new Set(timetable.filter(t => t.faculty_id === item.faculty_id).map(t => t.subject_name))].join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Room Info */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Classrooms</h4>
                          <div className="space-y-3">
                            {[...new Map(timetable.map(item => [item.room_id, item])).values()].map((item) => (
                              <div key={item.room_id} className="bg-white border rounded-lg p-4">
                                <h5 className="font-medium text-gray-900">📍 {item.room_name}</h5>
                                <p className="text-sm text-gray-600">Type: {item.room_type}</p>
                                <p className="text-sm text-gray-500">
                                  Used for: {[...new Set(timetable.filter(t => t.room_id === item.room_id).map(t => t.subject_name))].join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No faculty and room information available.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student" element={<StudentPortal />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;