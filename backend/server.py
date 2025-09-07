from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, time, timezone
from enum import Enum
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class DayOfWeek(str, Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"

class SubjectType(str, Enum):
    THEORY = "Theory"
    PRACTICAL = "Practical"
    TUTORIAL = "Tutorial"

# Data Models
class Room(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    capacity: int
    room_type: str  # "Classroom", "Laboratory", "Auditorium"
    equipment: List[str] = []
    available: bool = True

class Faculty(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department: str
    subjects: List[str] = []  # Subject IDs they can teach
    max_hours_per_day: int = 6
    max_hours_per_week: int = 30
    preferred_time_slots: List[str] = []
    unavailable_slots: List[str] = []

class Subject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    department: str
    semester: int
    subject_type: SubjectType
    hours_per_week: int
    requires_lab: bool = False
    faculty_ids: List[str] = []

class Batch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department: str
    semester: int
    student_count: int
    subjects: List[str] = []  # Subject IDs

class TimeSlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    day: DayOfWeek
    start_time: str  # "09:00"
    end_time: str    # "10:00"
    slot_number: int

class TimetableEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_id: str
    subject_id: str
    faculty_id: str
    room_id: str
    time_slot_id: str
    day: DayOfWeek
    start_time: str
    end_time: str

class Timetable(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department: str
    semester: int
    entries: List[TimetableEntry] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = False

class Assignment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    subject_id: str
    faculty_id: str
    batch_id: str
    due_date: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    roll_number: str
    batch_id: str
    department: str
    semester: int

# Create Data Models
class RoomCreate(BaseModel):
    name: str
    capacity: int
    room_type: str
    equipment: List[str] = []

class FacultyCreate(BaseModel):
    name: str
    department: str
    subjects: List[str] = []
    max_hours_per_day: int = 6
    max_hours_per_week: int = 30

class SubjectCreate(BaseModel):
    name: str
    code: str
    department: str
    semester: int
    subject_type: SubjectType
    hours_per_week: int
    requires_lab: bool = False

class BatchCreate(BaseModel):
    name: str
    department: str
    semester: int
    student_count: int
    subjects: List[str] = []

class AssignmentCreate(BaseModel):
    title: str
    description: str
    subject_id: str
    faculty_id: str
    batch_id: str
    due_date: datetime

# Timetable Generation Algorithm
class TimetableGenerator:
    def __init__(self):
        self.time_slots = self._generate_time_slots()
    
    def _generate_time_slots(self):
        """Generate standard time slots"""
        slots = []
        days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, 
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY]
        
        # Standard time slots (9 AM to 4 PM)
        times = [
            ("09:00", "10:00"), ("10:00", "11:00"), ("11:15", "12:15"),
            ("12:15", "13:15"), ("14:00", "15:00"), ("15:00", "16:00")
        ]
        
        slot_num = 1
        for day in days:
            for start_time, end_time in times:
                slots.append(TimeSlot(
                    day=day,
                    start_time=start_time,
                    end_time=end_time,
                    slot_number=slot_num
                ))
                slot_num += 1
        
        return slots
    
    async def generate_timetable(self, department: str, semester: int):
        """Generate optimized timetable for a department and semester"""
        
        # Fetch required data
        batches = await db.batches.find({"department": department, "semester": semester}).to_list(100)
        subjects = await db.subjects.find({"department": department, "semester": semester}).to_list(100)
        faculty = await db.faculty.find({"department": department}).to_list(100)
        rooms = await db.rooms.find({"available": True}).to_list(100)
        
        if not batches or not subjects or not faculty or not rooms:
            raise HTTPException(status_code=400, detail="Insufficient data for timetable generation")
        
        # Initialize timetable entries
        timetable_entries = []
        
        # Create a constraint solver
        for batch_data in batches:
            batch_subjects = [s for s in subjects if s["id"] in batch_data["subjects"]]
            
            for subject_data in batch_subjects:
                # Find available faculty for this subject
                available_faculty = [f for f in faculty if subject_data["id"] in f.get("subjects", [])]
                
                if not available_faculty:
                    continue
                
                # Generate entries based on hours per week
                hours_needed = subject_data["hours_per_week"]
                assigned_hours = 0
                
                # Simple scheduling algorithm
                for slot in self.time_slots:
                    if assigned_hours >= hours_needed:
                        break
                    
                    # Check if slot is available for batch, faculty, and room
                    faculty_member = random.choice(available_faculty)
                    room = self._find_available_room(rooms, subject_data.get("requires_lab", False))
                    
                    if room and self._is_slot_available(timetable_entries, batch_data["id"], 
                                                      faculty_member["id"], room["id"], slot):
                        entry = TimetableEntry(
                            batch_id=batch_data["id"],
                            subject_id=subject_data["id"],
                            faculty_id=faculty_member["id"],
                            room_id=room["id"],
                            time_slot_id=slot.id,
                            day=slot.day,
                            start_time=slot.start_time,
                            end_time=slot.end_time
                        )
                        timetable_entries.append(entry)
                        assigned_hours += 1
        
        # Create timetable object
        timetable = Timetable(
            name=f"{department} - Semester {semester} Timetable",
            department=department,
            semester=semester,
            entries=timetable_entries
        )
        
        return timetable
    
    def _find_available_room(self, rooms, requires_lab: bool):
        """Find an available room based on requirements"""
        suitable_rooms = rooms
        if requires_lab:
            suitable_rooms = [r for r in rooms if r["room_type"] == "Laboratory"]
        
        return suitable_rooms[0] if suitable_rooms else None
    
    def _is_slot_available(self, existing_entries, batch_id, faculty_id, room_id, slot):
        """Check if a time slot is available for batch, faculty, and room"""
        for entry in existing_entries:
            if (entry.day == slot.day and entry.start_time == slot.start_time and
                (entry.batch_id == batch_id or entry.faculty_id == faculty_id or entry.room_id == room_id)):
                return False
        return True

# Initialize timetable generator
timetable_generator = TimetableGenerator()

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Smart Classroom & Timetable Scheduler API"}

# Room Management
@api_router.post("/rooms", response_model=Room)
async def create_room(room_data: RoomCreate):
    room = Room(**room_data.dict())
    await db.rooms.insert_one(room.dict())
    return room

@api_router.get("/rooms", response_model=List[Room])
async def get_rooms():
    rooms = await db.rooms.find().to_list(100)
    return [Room(**room) for room in rooms]

# Faculty Management
@api_router.post("/faculty", response_model=Faculty)
async def create_faculty(faculty_data: FacultyCreate):
    faculty = Faculty(**faculty_data.dict())
    await db.faculty.insert_one(faculty.dict())
    return faculty

@api_router.get("/faculty", response_model=List[Faculty])
async def get_faculty():
    faculty_list = await db.faculty.find().to_list(100)
    return [Faculty(**faculty) for faculty in faculty_list]

# Subject Management
@api_router.post("/subjects", response_model=Subject)
async def create_subject(subject_data: SubjectCreate):
    subject = Subject(**subject_data.dict())
    await db.subjects.insert_one(subject.dict())
    return subject

@api_router.get("/subjects", response_model=List[Subject])
async def get_subjects():
    subjects = await db.subjects.find().to_list(100)
    return [Subject(**subject) for subject in subjects]

@api_router.get("/subjects/department/{department}/semester/{semester}", response_model=List[Subject])
async def get_subjects_by_dept_sem(department: str, semester: int):
    subjects = await db.subjects.find({"department": department, "semester": semester}).to_list(100)
    return [Subject(**subject) for subject in subjects]

# Batch Management
@api_router.post("/batches", response_model=Batch)
async def create_batch(batch_data: BatchCreate):
    batch = Batch(**batch_data.dict())
    await db.batches.insert_one(batch.dict())
    return batch

@api_router.get("/batches", response_model=List[Batch])
async def get_batches():
    batches = await db.batches.find().to_list(100)
    return [Batch(**batch) for batch in batches]

@api_router.get("/batches/department/{department}/semester/{semester}", response_model=List[Batch])
async def get_batches_by_dept_sem(department: str, semester: int):
    batches = await db.batches.find({"department": department, "semester": semester}).to_list(100)
    return [Batch(**batch) for batch in batches]

# Timetable Generation
@api_router.post("/timetables/generate/{department}/{semester}", response_model=Timetable)
async def generate_timetable(department: str, semester: int):
    timetable = await timetable_generator.generate_timetable(department, semester)
    await db.timetables.insert_one(timetable.dict())
    return timetable

@api_router.get("/timetables", response_model=List[Timetable])
async def get_timetables():
    timetables = await db.timetables.find().to_list(100)
    return [Timetable(**timetable) for timetable in timetables]

@api_router.get("/timetables/{timetable_id}", response_model=Timetable)
async def get_timetable(timetable_id: str):
    timetable = await db.timetables.find_one({"id": timetable_id})
    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found")
    return Timetable(**timetable)

# Student Portal APIs
@api_router.get("/student/timetable/{batch_id}")
async def get_student_timetable(batch_id: str):
    """Get timetable for a specific batch (student view)"""
    # Find active timetable for the batch
    batch = await db.batches.find_one({"id": batch_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    timetables = await db.timetables.find({
        "department": batch["department"], 
        "semester": batch["semester"],
        "is_active": True
    }).to_list(10)
    
    if not timetables:
        raise HTTPException(status_code=404, detail="No active timetable found")
    
    timetable = timetables[0]
    
    # Filter entries for this batch and enrich with details
    batch_entries = []
    for entry in timetable["entries"]:
        if entry["batch_id"] == batch_id:
            # Get subject, faculty, and room details
            subject = await db.subjects.find_one({"id": entry["subject_id"]})
            faculty = await db.faculty.find_one({"id": entry["faculty_id"]})
            room = await db.rooms.find_one({"id": entry["room_id"]})
            
            enriched_entry = {
                **entry,
                "subject_name": subject["name"] if subject else "Unknown",
                "subject_code": subject["code"] if subject else "N/A",
                "faculty_name": faculty["name"] if faculty else "Unknown",
                "room_name": room["name"] if room else "Unknown",
                "room_type": room["room_type"] if room else "Unknown"
            }
            batch_entries.append(enriched_entry)
    
    return {"timetable": batch_entries, "batch_info": batch}

# Assignment Management
@api_router.post("/assignments", response_model=Assignment)
async def create_assignment(assignment_data: AssignmentCreate):
    assignment = Assignment(**assignment_data.dict())
    await db.assignments.insert_one(assignment.dict())
    return assignment

@api_router.get("/assignments/batch/{batch_id}", response_model=List[Dict[str, Any]])
async def get_assignments_for_batch(batch_id: str):
    assignments = await db.assignments.find({"batch_id": batch_id}).to_list(100)
    
    # Enrich with subject and faculty details
    enriched_assignments = []
    for assignment in assignments:
        subject = await db.subjects.find_one({"id": assignment["subject_id"]})
        faculty = await db.faculty.find_one({"id": assignment["faculty_id"]})
        
        enriched_assignment = {
            **assignment,
            "subject_name": subject["name"] if subject else "Unknown",
            "subject_code": subject["code"] if subject else "N/A",
            "faculty_name": faculty["name"] if faculty else "Unknown"
        }
        enriched_assignments.append(enriched_assignment)
    
    return enriched_assignments

# Faculty and Room Info APIs
@api_router.get("/faculty/{faculty_id}", response_model=Faculty)
async def get_faculty_details(faculty_id: str):
    faculty = await db.faculty.find_one({"id": faculty_id})
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return Faculty(**faculty)

@api_router.get("/rooms/{room_id}", response_model=Room)
async def get_room_details(room_id: str):
    room = await db.rooms.find_one({"id": room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return Room(**room)

# Initialize sample data endpoint
@api_router.post("/init-sample-data")
async def initialize_sample_data():
    """Initialize the system with sample data for demonstration"""
    
    # Clear existing data
    await db.rooms.delete_many({})
    await db.faculty.delete_many({})
    await db.subjects.delete_many({})
    await db.batches.delete_many({})
    await db.assignments.delete_many({})
    
    # Sample Rooms
    rooms = [
        Room(name="Room 101", capacity=60, room_type="Classroom"),
        Room(name="Room 102", capacity=40, room_type="Classroom"),
        Room(name="Lab A", capacity=30, room_type="Laboratory", equipment=["Computers", "Projector"]),
        Room(name="Lab B", capacity=25, room_type="Laboratory", equipment=["Equipment", "Projector"]),
        Room(name="Auditorium", capacity=200, room_type="Auditorium", equipment=["Sound System", "Projector"])
    ]
    
    for room in rooms:
        await db.rooms.insert_one(room.dict())
    
    # Sample Subjects
    subjects = [
        Subject(name="Data Structures", code="CS201", department="Computer Science", 
                semester=3, subject_type=SubjectType.THEORY, hours_per_week=4),
        Subject(name="Database Management", code="CS202", department="Computer Science", 
                semester=3, subject_type=SubjectType.THEORY, hours_per_week=3),
        Subject(name="Programming Lab", code="CS203", department="Computer Science", 
                semester=3, subject_type=SubjectType.PRACTICAL, hours_per_week=2, requires_lab=True),
        Subject(name="Mathematics III", code="MA201", department="Computer Science", 
                semester=3, subject_type=SubjectType.THEORY, hours_per_week=4),
        Subject(name="Software Engineering", code="CS204", department="Computer Science", 
                semester=3, subject_type=SubjectType.THEORY, hours_per_week=3)
    ]
    
    subject_ids = []
    for subject in subjects:
        await db.subjects.insert_one(subject.dict())
        subject_ids.append(subject.id)
    
    # Sample Faculty
    faculty_list = [
        Faculty(name="Dr. John Smith", department="Computer Science", 
                subjects=subject_ids[:2], max_hours_per_day=6, max_hours_per_week=24),
        Faculty(name="Prof. Sarah Johnson", department="Computer Science", 
                subjects=subject_ids[1:3], max_hours_per_day=5, max_hours_per_week=20),
        Faculty(name="Dr. Mike Wilson", department="Computer Science", 
                subjects=[subject_ids[0], subject_ids[3]], max_hours_per_day=6, max_hours_per_week=25),
        Faculty(name="Prof. Emily Davis", department="Computer Science", 
                subjects=subject_ids[3:], max_hours_per_day=5, max_hours_per_week=22)
    ]
    
    for faculty in faculty_list:
        await db.faculty.insert_one(faculty.dict())
    
    # Sample Batches
    batches = [
        Batch(name="CS-3A", department="Computer Science", semester=3, 
              student_count=45, subjects=subject_ids),
        Batch(name="CS-3B", department="Computer Science", semester=3, 
              student_count=42, subjects=subject_ids)
    ]
    
    for batch in batches:
        await db.batches.insert_one(batch.dict())
    
    # Sample Assignments
    assignments = [
        Assignment(title="Data Structure Implementation", 
                  description="Implement stack and queue using arrays",
                  subject_id=subject_ids[0], faculty_id=faculty_list[0].id,
                  batch_id=batches[0].id, 
                  due_date=datetime(2025, 1, 15, 23, 59, 59, tzinfo=timezone.utc)),
        Assignment(title="Database Design Project", 
                  description="Design a database for library management system",
                  subject_id=subject_ids[1], faculty_id=faculty_list[1].id,
                  batch_id=batches[0].id, 
                  due_date=datetime(2025, 1, 20, 23, 59, 59, tzinfo=timezone.utc))
    ]
    
    for assignment in assignments:
        await db.assignments.insert_one(assignment.dict())
    
    return {"message": "Sample data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()