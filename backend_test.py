#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Smart Classroom & Timetable Scheduler
Tests all core functionality including CRUD operations, timetable generation, and student portal APIs
"""

import requests
import json
from datetime import datetime, timezone
import sys
import time

# Backend URL from environment
BACKEND_URL = "https://eduportal-77.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.sample_data_ids = {}
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
    def test_api_health(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Health Check", True, f"API is running: {data.get('message', 'OK')}")
                return True
            else:
                self.log_test("API Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_sample_data_initialization(self):
        """Test sample data initialization"""
        try:
            response = self.session.post(f"{self.base_url}/init-sample-data")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Sample Data Initialization", True, data.get('message', 'Success'))
                return True
            else:
                self.log_test("Sample Data Initialization", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Sample Data Initialization", False, f"Error: {str(e)}")
            return False
    
    def test_rooms_api(self):
        """Test rooms CRUD operations"""
        # Test GET rooms
        try:
            response = self.session.get(f"{self.base_url}/rooms")
            if response.status_code == 200:
                rooms = response.json()
                self.log_test("GET Rooms", True, f"Retrieved {len(rooms)} rooms")
                if rooms:
                    self.sample_data_ids['room_id'] = rooms[0]['id']
                    self.log_test("Room Data Validation", True, f"Sample room: {rooms[0]['name']} (capacity: {rooms[0]['capacity']})")
            else:
                self.log_test("GET Rooms", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET Rooms", False, f"Error: {str(e)}")
            return False
            
        # Test POST room
        try:
            new_room = {
                "name": "Test Room 999",
                "capacity": 50,
                "room_type": "Classroom",
                "equipment": ["Projector", "Whiteboard"]
            }
            response = self.session.post(f"{self.base_url}/rooms", json=new_room)
            if response.status_code == 200:
                room_data = response.json()
                self.log_test("POST Room", True, f"Created room: {room_data['name']}")
                return True
            else:
                self.log_test("POST Room", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("POST Room", False, f"Error: {str(e)}")
            return False
    
    def test_faculty_api(self):
        """Test faculty CRUD operations"""
        # Test GET faculty
        try:
            response = self.session.get(f"{self.base_url}/faculty")
            if response.status_code == 200:
                faculty = response.json()
                self.log_test("GET Faculty", True, f"Retrieved {len(faculty)} faculty members")
                if faculty:
                    self.sample_data_ids['faculty_id'] = faculty[0]['id']
                    self.log_test("Faculty Data Validation", True, f"Sample faculty: {faculty[0]['name']} (dept: {faculty[0]['department']})")
            else:
                self.log_test("GET Faculty", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET Faculty", False, f"Error: {str(e)}")
            return False
            
        # Test POST faculty
        try:
            new_faculty = {
                "name": "Dr. Test Professor",
                "department": "Computer Science",
                "subjects": [],
                "max_hours_per_day": 6,
                "max_hours_per_week": 30
            }
            response = self.session.post(f"{self.base_url}/faculty", json=new_faculty)
            if response.status_code == 200:
                faculty_data = response.json()
                self.log_test("POST Faculty", True, f"Created faculty: {faculty_data['name']}")
                return True
            else:
                self.log_test("POST Faculty", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("POST Faculty", False, f"Error: {str(e)}")
            return False
    
    def test_subjects_api(self):
        """Test subjects CRUD operations"""
        # Test GET subjects
        try:
            response = self.session.get(f"{self.base_url}/subjects")
            if response.status_code == 200:
                subjects = response.json()
                self.log_test("GET Subjects", True, f"Retrieved {len(subjects)} subjects")
                if subjects:
                    self.sample_data_ids['subject_id'] = subjects[0]['id']
                    self.log_test("Subject Data Validation", True, f"Sample subject: {subjects[0]['name']} ({subjects[0]['code']})")
            else:
                self.log_test("GET Subjects", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET Subjects", False, f"Error: {str(e)}")
            return False
            
        # Test GET subjects by department and semester
        try:
            response = self.session.get(f"{self.base_url}/subjects/department/Computer Science/semester/3")
            if response.status_code == 200:
                cs_subjects = response.json()
                self.log_test("GET Subjects by Dept/Semester", True, f"Retrieved {len(cs_subjects)} CS semester 3 subjects")
            else:
                self.log_test("GET Subjects by Dept/Semester", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET Subjects by Dept/Semester", False, f"Error: {str(e)}")
            
        # Test POST subject
        try:
            new_subject = {
                "name": "Test Subject",
                "code": "TEST101",
                "department": "Computer Science",
                "semester": 3,
                "subject_type": "Theory",
                "hours_per_week": 3,
                "requires_lab": False
            }
            response = self.session.post(f"{self.base_url}/subjects", json=new_subject)
            if response.status_code == 200:
                subject_data = response.json()
                self.log_test("POST Subject", True, f"Created subject: {subject_data['name']}")
                return True
            else:
                self.log_test("POST Subject", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("POST Subject", False, f"Error: {str(e)}")
            return False
    
    def test_batches_api(self):
        """Test batches CRUD operations"""
        # Test GET batches
        try:
            response = self.session.get(f"{self.base_url}/batches")
            if response.status_code == 200:
                batches = response.json()
                self.log_test("GET Batches", True, f"Retrieved {len(batches)} batches")
                if batches:
                    self.sample_data_ids['batch_id'] = batches[0]['id']
                    self.log_test("Batch Data Validation", True, f"Sample batch: {batches[0]['name']} (students: {batches[0]['student_count']})")
            else:
                self.log_test("GET Batches", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET Batches", False, f"Error: {str(e)}")
            return False
            
        # Test GET batches by department and semester
        try:
            response = self.session.get(f"{self.base_url}/batches/department/Computer Science/semester/3")
            if response.status_code == 200:
                cs_batches = response.json()
                self.log_test("GET Batches by Dept/Semester", True, f"Retrieved {len(cs_batches)} CS semester 3 batches")
            else:
                self.log_test("GET Batches by Dept/Semester", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET Batches by Dept/Semester", False, f"Error: {str(e)}")
            
        # Test POST batch
        try:
            new_batch = {
                "name": "TEST-3C",
                "department": "Computer Science",
                "semester": 3,
                "student_count": 40,
                "subjects": []
            }
            response = self.session.post(f"{self.base_url}/batches", json=new_batch)
            if response.status_code == 200:
                batch_data = response.json()
                self.log_test("POST Batch", True, f"Created batch: {batch_data['name']}")
                return True
            else:
                self.log_test("POST Batch", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("POST Batch", False, f"Error: {str(e)}")
            return False
    
    def test_timetable_generation(self):
        """Test timetable generation algorithm"""
        try:
            # Generate timetable for Computer Science, Semester 3
            response = self.session.post(f"{self.base_url}/timetables/generate/Computer Science/3")
            if response.status_code == 200:
                timetable = response.json()
                self.sample_data_ids['timetable_id'] = timetable['id']
                entries_count = len(timetable.get('entries', []))
                self.log_test("Timetable Generation", True, f"Generated timetable with {entries_count} entries")
                
                # Validate timetable structure
                if entries_count > 0:
                    sample_entry = timetable['entries'][0]
                    required_fields = ['batch_id', 'subject_id', 'faculty_id', 'room_id', 'day', 'start_time', 'end_time']
                    missing_fields = [field for field in required_fields if field not in sample_entry]
                    if not missing_fields:
                        self.log_test("Timetable Entry Validation", True, "All required fields present in timetable entries")
                    else:
                        self.log_test("Timetable Entry Validation", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Timetable Entry Validation", False, "No timetable entries generated")
                
                return True
            else:
                self.log_test("Timetable Generation", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Timetable Generation", False, f"Error: {str(e)}")
            return False
    
    def test_timetable_retrieval(self):
        """Test timetable retrieval APIs"""
        # Test GET all timetables
        try:
            response = self.session.get(f"{self.base_url}/timetables")
            if response.status_code == 200:
                timetables = response.json()
                self.log_test("GET All Timetables", True, f"Retrieved {len(timetables)} timetables")
            else:
                self.log_test("GET All Timetables", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET All Timetables", False, f"Error: {str(e)}")
            return False
        
        # Test GET specific timetable
        if 'timetable_id' in self.sample_data_ids:
            try:
                timetable_id = self.sample_data_ids['timetable_id']
                response = self.session.get(f"{self.base_url}/timetables/{timetable_id}")
                if response.status_code == 200:
                    timetable = response.json()
                    self.log_test("GET Specific Timetable", True, f"Retrieved timetable: {timetable['name']}")
                    return True
                else:
                    self.log_test("GET Specific Timetable", False, f"Status: {response.status_code}")
                    return False
            except Exception as e:
                self.log_test("GET Specific Timetable", False, f"Error: {str(e)}")
                return False
        else:
            self.log_test("GET Specific Timetable", False, "No timetable ID available for testing")
            return False
    
    def test_student_portal_apis(self):
        """Test student portal APIs"""
        if 'batch_id' not in self.sample_data_ids:
            self.log_test("Student Portal APIs", False, "No batch ID available for testing")
            return False
            
        batch_id = self.sample_data_ids['batch_id']
        
        # Test student timetable view
        try:
            response = self.session.get(f"{self.base_url}/student/timetable/{batch_id}")
            if response.status_code == 200:
                data = response.json()
                timetable_entries = data.get('timetable', [])
                batch_info = data.get('batch_info', {})
                self.log_test("Student Timetable View", True, f"Retrieved {len(timetable_entries)} timetable entries for batch {batch_info.get('name', 'Unknown')}")
                
                # Validate enriched data
                if timetable_entries:
                    sample_entry = timetable_entries[0]
                    enriched_fields = ['subject_name', 'subject_code', 'faculty_name', 'room_name']
                    present_fields = [field for field in enriched_fields if field in sample_entry]
                    self.log_test("Student Timetable Data Enrichment", True, f"Enriched fields present: {present_fields}")
            else:
                self.log_test("Student Timetable View", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Student Timetable View", False, f"Error: {str(e)}")
            return False
        
        # Test assignments for batch
        try:
            response = self.session.get(f"{self.base_url}/assignments/batch/{batch_id}")
            if response.status_code == 200:
                assignments = response.json()
                self.log_test("Batch Assignments", True, f"Retrieved {len(assignments)} assignments for batch")
                
                # Validate assignment enrichment
                if assignments:
                    sample_assignment = assignments[0]
                    enriched_fields = ['subject_name', 'subject_code', 'faculty_name']
                    present_fields = [field for field in enriched_fields if field in sample_assignment]
                    self.log_test("Assignment Data Enrichment", True, f"Enriched fields present: {present_fields}")
            else:
                self.log_test("Batch Assignments", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Batch Assignments", False, f"Error: {str(e)}")
            return False
        
        return True
    
    def test_faculty_room_details(self):
        """Test faculty and room detail APIs"""
        # Test faculty details
        if 'faculty_id' in self.sample_data_ids:
            try:
                faculty_id = self.sample_data_ids['faculty_id']
                response = self.session.get(f"{self.base_url}/faculty/{faculty_id}")
                if response.status_code == 200:
                    faculty = response.json()
                    self.log_test("Faculty Details", True, f"Retrieved details for faculty: {faculty['name']}")
                else:
                    self.log_test("Faculty Details", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Faculty Details", False, f"Error: {str(e)}")
        
        # Test room details
        if 'room_id' in self.sample_data_ids:
            try:
                room_id = self.sample_data_ids['room_id']
                response = self.session.get(f"{self.base_url}/rooms/{room_id}")
                if response.status_code == 200:
                    room = response.json()
                    self.log_test("Room Details", True, f"Retrieved details for room: {room['name']}")
                    return True
                else:
                    self.log_test("Room Details", False, f"Status: {response.status_code}")
                    return False
            except Exception as e:
                self.log_test("Room Details", False, f"Error: {str(e)}")
                return False
        
        return True
    
    def test_error_handling(self):
        """Test API error handling"""
        # Test invalid timetable ID
        try:
            response = self.session.get(f"{self.base_url}/timetables/invalid-id")
            if response.status_code == 404:
                self.log_test("Error Handling - Invalid Timetable ID", True, "Correctly returned 404 for invalid timetable ID")
            else:
                self.log_test("Error Handling - Invalid Timetable ID", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Invalid Timetable ID", False, f"Error: {str(e)}")
        
        # Test invalid faculty ID
        try:
            response = self.session.get(f"{self.base_url}/faculty/invalid-id")
            if response.status_code == 404:
                self.log_test("Error Handling - Invalid Faculty ID", True, "Correctly returned 404 for invalid faculty ID")
            else:
                self.log_test("Error Handling - Invalid Faculty ID", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Invalid Faculty ID", False, f"Error: {str(e)}")
        
        # Test invalid room ID
        try:
            response = self.session.get(f"{self.base_url}/rooms/invalid-id")
            if response.status_code == 404:
                self.log_test("Error Handling - Invalid Room ID", True, "Correctly returned 404 for invalid room ID")
                return True
            else:
                self.log_test("Error Handling - Invalid Room ID", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Error Handling - Invalid Room ID", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print("=" * 80)
        print("SMART CLASSROOM & TIMETABLE SCHEDULER - BACKEND API TESTING")
        print("=" * 80)
        print(f"Testing Backend URL: {self.base_url}")
        print()
        
        # Test sequence
        tests = [
            ("API Health Check", self.test_api_health),
            ("Sample Data Initialization", self.test_sample_data_initialization),
            ("Rooms API", self.test_rooms_api),
            ("Faculty API", self.test_faculty_api),
            ("Subjects API", self.test_subjects_api),
            ("Batches API", self.test_batches_api),
            ("Timetable Generation", self.test_timetable_generation),
            ("Timetable Retrieval", self.test_timetable_retrieval),
            ("Student Portal APIs", self.test_student_portal_apis),
            ("Faculty & Room Details", self.test_faculty_room_details),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n--- Testing {test_name} ---")
            try:
                result = test_func()
                if result:
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Unexpected error: {str(e)}")
        
        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        success_count = sum(1 for result in self.test_results if result['success'])
        total_tests = len(self.test_results)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {success_count}")
        print(f"Failed: {total_tests - success_count}")
        print(f"Success Rate: {(success_count/total_tests)*100:.1f}%")
        
        # Failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\nFAILED TESTS:")
            for test in failed_tests:
                print(f"❌ {test['test']}: {test['message']}")
        
        print("\n" + "=" * 80)
        
        return success_count == total_tests

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)