from pymongo import MongoClient
import hashlib
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

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

        # Hash the password using SHA-256
        salt = os.urandom(32)
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)

        student = {
            'matrikelnummer': matrikelnummer,
            'password': hashed,
            'salt': salt,
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

        # Verify password using stored salt
        stored_salt = student['salt']
        test_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), stored_salt, 100000)
        if test_hash == student['password']:
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
            # Convert ObjectId to string and remove sensitive data
            student['_id'] = str(student['_id'])
            del student['password']
            del student['salt']
        return student
