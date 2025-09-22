from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['sensor_dashboard']

class Measurement:
    def __init__(self):
        self.measurements = db['measurements']
        self.readings = db['sensor_readings']
    
    def create_measurement(self, student_id, product_name, product_number, date_string, 
                         clean_duration, enrich_duration, measure_duration, csv_data=None, status='in_progress'):
        """Create a new measurement session"""
        measurement = {
            'student_id': student_id,
            'product_name': product_name,
            'product_number': product_number,
            'date_string': date_string,
            'clean_duration': clean_duration,
            'enrich_duration': enrich_duration,
            'measure_duration': measure_duration,
            'created_at': datetime.utcnow(),
            'status': status
        }
        
        if csv_data:
            measurement['csv_data'] = csv_data
            measurement['completed_at'] = datetime.utcnow()
            
        return self.measurements.insert_one(measurement)

    def add_sensor_reading(self, measurement_id, timestamp, sensor_values):
        """Add a single sensor reading to a measurement"""
        reading = {
            'measurement_id': measurement_id,
            'timestamp': timestamp,
            'sensor_values': {
                'MQ136': sensor_values[0],
                'MQ138': sensor_values[1],
                'MQ137': sensor_values[2],
                'MQ4': sensor_values[3],
                'MQ9': sensor_values[4],
                'MQ8': sensor_values[5],
                'MQ3_10': sensor_values[6],
                'MQ5': sensor_values[7],
                'MQ2': sensor_values[8],
                'MQ135': sensor_values[9],
                'MQ6': sensor_values[10],
                'MQ3_1': sensor_values[11]
            }
        }
        return self.readings.insert_one(reading)

    def complete_measurement(self, measurement_id):
        """Mark a measurement as completed"""
        return self.measurements.update_one(
            {'_id': measurement_id},
            {'$set': {'status': 'completed', 'completed_at': datetime.utcnow()}}
        )

    def get_measurement_readings(self, measurement_id):
        """Get all readings for a specific measurement"""
        return list(self.readings.find({'measurement_id': measurement_id}))

    def export_to_csv(self, measurement_id):
        """Export measurement readings to CSV format"""
        readings = self.get_measurement_readings(measurement_id)
        csv_lines = ['time,MQ136,MQ138,MQ137,MQ4,MQ9,MQ8,MQ3_10,MQ5,MQ2,MQ135,MQ6,MQ3_1']
        
        for reading in readings:
            values = reading['sensor_values']
            line = [
                reading['timestamp'].strftime('%H:%M:%S'),
                str(values['MQ136']),
                str(values['MQ138']),
                str(values['MQ137']),
                str(values['MQ4']),
                str(values['MQ9']),
                str(values['MQ8']),
                str(values['MQ3_10']),
                str(values['MQ5']),
                str(values['MQ2']),
                str(values['MQ135']),
                str(values['MQ6']),
                str(values['MQ3_1'])
            ]
            csv_lines.append(','.join(line))
        
        return '\n'.join(csv_lines)

    def get_student_measurements(self, student_id):
        """Get all measurements for a specific student"""
        measurements = list(self.measurements.find({'student_id': student_id}))
        # Convert ObjectIds to strings
        for measurement in measurements:
            measurement['_id'] = str(measurement['_id'])
        return measurements

    def get_measurement(self, measurement_id, student_id):
        """Get a specific measurement"""
        try:
            measurement = self.measurements.find_one({
                '_id': ObjectId(measurement_id),
                'student_id': student_id
            })
            if measurement:
                measurement['_id'] = str(measurement['_id'])
            return measurement
        except Exception as e:
            print(f"Error getting measurement: {str(e)}")
            return None

    def delete_measurement(self, measurement_id, student_id):
        """Delete a measurement and its readings"""
        try:
            # First verify the measurement belongs to the student
            measurement = self.measurements.find_one({
                '_id': ObjectId(measurement_id),
                'student_id': student_id
            })
            
            if not measurement:
                raise Exception("Measurement not found or access denied")
            
            # Delete the measurement and all its readings
            self.readings.delete_many({'measurement_id': ObjectId(measurement_id)})
            self.measurements.delete_one({'_id': ObjectId(measurement_id)})
        except Exception as e:
            print(f"Error deleting measurement: {str(e)}")
            raise

    def add_measurement_data(self, measurement_id, csv_content):
        """Add the final CSV data to a measurement"""
        # Update the measurement with the CSV data
        self.measurements.update_one(
            {'_id': ObjectId(measurement_id)},
            {
                '$set': {
                    'csv_data': csv_content,
                    'status': 'completed',
                    'completed_at': datetime.utcnow()
                }
            }
        )
