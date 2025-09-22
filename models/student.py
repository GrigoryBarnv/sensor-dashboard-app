from pymongo import MongoClient
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['sensor_dashboard']

class Student:
    def __init__(self):
        self.students = db['students']
        # Create unique index on matrikelnummer
        self.students.create_index('matrikelnummer', unique=True)

    def register(self, matrikelnummer, password):
        """Register a new student"""
        # Check if student already exists
        if self.students.find_one({'matrikelnummer': matrikelnummer}):
            return False, "Student already registered"

        # Hash the password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

        student = {
            'matrikelnummer': matrikelnummer,
            'password': hashed,
            'created_at': datetime.utcnow(),
            'last_login': None
        }

        try:
            self.students.insert_one(student)
            return True, "Registration successful"
        except Exception as e:
            return False, str(e)

    def login(self, matrikelnummer, password):
        """Login a student"""
        student = self.students.find_one({'matrikelnummer': matrikelnummer})
        if not student:
            return False, "Student not found"

        if bcrypt.checkpw(password.encode('utf-8'), student['password']):
            # Update last login time
            self.students.update_one(
                {'_id': student['_id']},
                {'$set': {'last_login': datetime.utcnow()}}
            )
            return True, "Login successful"
        return False, "Invalid password"

    def get_student(self, matrikelnummer):
        """Get student information"""
        student = self.students.find_one({'matrikelnummer': matrikelnummer})
        if student:
            # Convert ObjectId to string and remove password
            student['_id'] = str(student['_id'])
            del student['password']
        return student
