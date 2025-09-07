import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, MapPin, Clock, User, ChevronRight, CheckCircle, AlertCircle, Home, Settings, GraduationCap } from 'lucide-react';

const API_BASE_URL = 'https://eduportal-77.preview.emergentagent.com/api';

const SmartClassroomApp = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState([]);
  const [timetableData, setTimetableData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [adminData, setAdminData] = useState({
    rooms: [],
    faculty: [],
    subjects: [],
    batches: [],
    timetables: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState(3);
  const [activeTab, setActiveTab] = useState('timetable');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch batches on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  // Fetch admin data when admin page is accessed
  useEffect(() => {
    if (currentPage === 'admin') {
      fetchAdminData();
    }
  }, [currentPage]);

  // Fetch timetable and assignments when batch is selected
  useEffect(() => {
    if (selectedBatch && currentPage === 'student') {
      fetchStudentData();
    }
  }, [selectedBatch, currentPage]);

  const fetchBatches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/batches`);
      const data = await response.json();
      setBatches(data);
      if (data.length > 0) {
        setSelectedBatch(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [roomsRes, facultyRes, subjectsRes, batchesRes, timetablesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/rooms`),
        fetch(`${API_BASE_URL}/faculty`),
        fetch(`${API_BASE_URL}/subjects`),
        fetch(`${API_BASE_URL}/batches`),
        fetch(`${API_BASE_URL}/timetables`)
      ]);

      const [rooms, faculty, subjects, batches, timetables] = await Promise.all([
        roomsRes.json(),
        facultyRes.json(),
        subjectsRes.json(),
        batchesRes.json(),
        timetablesRes.json()
      ]);

      setAdminData({ rooms, faculty, subjects, batches, timetables });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showNotification('Error loading admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      const [timetableRes, assignmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/student/timetable/${selectedBatch}`),
        fetch(`${API_BASE_URL}/assignments/batch/${selectedBatch}`)
      ]);

      const timetableData = await timetableRes.json();
      const assignmentsData = await assignmentsRes.json();

      setTimetableData(timetableData.timetable || []);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching student data:', error);
      showNotification('Error loading student data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSampleData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/init-sample-data`, {
        method: 'POST'
      });
      const data = await response.json();
      showNotification('Sample data initialized successfully!');
      fetchAdminData();
    } catch (error) {
      console.error('Error initializing sample data:', error);
      showNotification('Error initializing sample data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimetable = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/timetables/generate/${selectedDepartment}/${selectedSemester}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        showNotification(`Timetable generated successfully with ${data.entries.length} entries!`);
        
        // Activate the generated timetable
        await fetch(`${API_BASE_URL}/timetables/${data.id}/activate`, {
          method: 'PATCH'
        });
        
        fetchAdminData();
      } else {
        const errorData = await response.json();
        showNotification(errorData.detail || 'Error generating timetable', 'error');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      showNotification('Error generating timetable', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCurrentSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/timetables/clear/${selectedDepartment}/${selectedSemester}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      showNotification(data.message);
      fetchAdminData();
    } catch (error) {
      console.error('Error clearing schedule:', error);
      showNotification('Error clearing schedule', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/timetables/clear-all`, {
        method: 'DELETE'
      });
      const data = await response.json();
      showNotification(data.message);
      fetchAdminData();
    } catch (error) {
      console.error('Error clearing all schedules:', error);
      showNotification('Error clearing all schedules', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format timetable data for display
  const formatTimetableForDisplay = (timetableEntries) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
      '09:00-10:00', '10:00-11:00', '11:15-12:15', 
      '12:15-13:15', '14:00-15:00', '15:00-16:00', '16:00-17:00'
    ];
    
    const timetableGrid = {};
    
    // Initialize grid
    days.forEach(day => {
      timetableGrid[day] = {};
      timeSlots.forEach(slot => {
        timetableGrid[day][slot] = null;
      });
    });
    
    // Populate grid with entries
    timetableEntries.forEach(entry => {
      const timeSlot = `${entry.start_time}-${entry.end_time}`;
      if (timetableGrid[entry.day] && timeSlots.includes(timeSlot)) {
        timetableGrid[entry.day][timeSlot] = entry;
      }
    });
    
    return { grid: timetableGrid, days, timeSlots };
  };

  const TimetableDisplay = ({ timetableEntries }) => {
    const { grid, days, timeSlots } = formatTimetableForDisplay(timetableEntries);
    
    if (timetableEntries.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No timetable available. Please contact administration.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700">Time</th>
              {days.map(day => (
                <th key={day} className="border border-gray-200 p-3 text-center font-semibold text-gray-700 min-w-[150px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-3 font-medium text-gray-600 bg-gray-50">
                  {timeSlot}
                </td>
                {days.map(day => {
                  const entry = grid[day][timeSlot];
                  return (
                    <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3">
                      {entry ? (
                        <div className="text-sm">
                          <div className="font-semibold text-blue-900 mb-1">
                            {entry.subject_name}
                          </div>
                          <div className="text-gray-600 mb-1">
                            {entry.subject_code}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <User className="h-3 w-3 mr-1" />
                            {entry.faculty_name}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {entry.room_name}
                          </div>
                        </div>
                      ) : (
                        <div className="h-16"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SmartClass</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('admin')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin Portal
              </button>
              <button
                onClick={() => setCurrentPage('student')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Student Portal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Classroom & 
            <span className="text-blue-600"> Timetable Scheduler</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Revolutionize your educational institution with AI-powered scheduling, 
            optimal resource utilization, and seamless student-faculty coordination.
          </p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => setCurrentPage('admin')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition flex items-center text-lg font-semibold shadow-lg"
            >
              Get Started
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
            <button
              onClick={() => setCurrentPage('student')}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg font-semibold"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h4>
              <p className="text-gray-600">AI-powered timetable generation with conflict resolution and optimization</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Resource Management</h4>
              <p className="text-gray-600">Optimal allocation of classrooms, labs, and faculty across departments</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition">
              <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Student Portal</h4>
              <p className="text-gray-600">Easy access to schedules, assignments, and academic information</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SmartClass?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your institution's scheduling challenges into competitive advantages
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: "Save Time", desc: "Reduce scheduling time by 90%" },
              { icon: CheckCircle, title: "Zero Conflicts", desc: "Eliminate scheduling conflicts" },
              { icon: Users, title: "Better Utilization", desc: "Maximize resource efficiency" },
              { icon: BookOpen, title: "Enhanced Learning", desc: "Optimize learning outcomes" }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <benefit.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">SmartClass</h3>
          </div>
          <p className="text-gray-400 mb-8">
            Empowering educational institutions with intelligent scheduling solutions
          </p>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">© 2025 SmartClass. Built for educational excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // Admin Portal Component
  const AdminPortal = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage('landing')}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Home className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">SmartClass Administration</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Settings },
              { id: 'generate', name: 'Generate Timetable', icon: Calendar },
              { id: 'view', name: 'View Timetables', icon: BookOpen }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition ${
                  adminTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{adminData.rooms.length}</div>
                  <div className="text-sm text-gray-600">Total Rooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{adminData.faculty.length}</div>
                  <div className="text-sm text-gray-600">Faculty Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{adminData.subjects.length}</div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{adminData.batches.length}</div>
                  <div className="text-sm text-gray-600">Batches</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <button
                onClick={initializeSampleData}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Initializing...' : 'Initialize Sample Data'}
              </button>
            </div>
          </div>
        )}

        {/* Generate Timetable Tab */}
        {adminTab === 'generate' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Timetable</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={generateTimetable}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate Timetable'}
                </button>
                <button
                  onClick={clearCurrentSchedule}
                  disabled={isLoading}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                  Clear Current Schedule
                </button>
                <button
                  onClick={clearAllSchedules}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Clear All Schedules
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Timetables Tab */}
        {adminTab === 'view' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Generated Timetables</h2>
            {adminData.timetables.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No timetables generated yet.</p>
            ) : (
              <div className="space-y-4">
                {adminData.timetables.map((timetable) => (
                  <div key={timetable.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{timetable.name}</h3>
                        <p className="text-sm text-gray-600">
                          {timetable.department} - Semester {timetable.semester} 
                          ({timetable.entries.length} entries)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          timetable.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {timetable.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Student Portal Component
  const StudentPortal = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage('landing')}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Home className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} ({batch.department} - Sem {batch.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'timetable', name: 'Timetable', icon: Calendar },
              { id: 'assignments', name: 'Assignments', icon: BookOpen },
              { id: 'info', name: 'Faculty & Rooms', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Timetable Tab */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Weekly Timetable</h2>
              {isLoading && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </div>
              )}
            </div>
            <TimetableDisplay timetableEntries={timetableData} />
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Assignments</h2>
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment, index) => (
                  <div key={assignment.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <span className="text-sm text-gray-500">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{assignment.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-blue-600">
                          {assignment.subject_name} ({assignment.subject_code})
                        </span>
                        <span className="text-gray-500">
                          by {assignment.faculty_name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        new Date(assignment.due_date) > new Date() 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {new Date(assignment.due_date) > new Date() ? 'Active' : 'Overdue'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Faculty & Rooms Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Faculty Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Faculty Information</h2>
              {adminData.faculty.length === 0 ? (
                <p className="text-gray-500">No faculty information available.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {adminData.faculty.map((faculty) => (
                    <div key={faculty.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{faculty.name}</h3>
                          <p className="text-sm text-gray-600">{faculty.department}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Max Hours/Day: {faculty.max_hours_per_day}</p>
                        <p>Max Hours/Week: {faculty.max_hours_per_week}</p>
                        <p>Subjects: {faculty.subjects.length}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Room Information</h2>
              {adminData.rooms.length === 0 ? (
                <p className="text-gray-500">No room information available.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminData.rooms.map((room) => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPin className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{room.name}</h3>
                          <p className="text-sm text-gray-600">{room.room_type}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <p>Capacity: {room.capacity} students</p>
                      </div>
                      {room.equipment && room.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.map((item, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Notification Component
  const Notification = ({ message, type, onClose }) => (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{message}</span>
        </div>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="relative">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Page rendering */}
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'admin' && <AdminPortal />}
      {currentPage === 'student' && <StudentPortal />}
    </div>
  );
};

export default SmartClassroomApp;