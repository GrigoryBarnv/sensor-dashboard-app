class MeasurementBuffer:
    def __init__(self):
        self.buffer = []
        self.sensor_order = [
            "MQ136", "MQ138", "MQ137", "MQ4", "MQ9", "MQ8",
            "MQ3_10", "MQ5", "MQ2", "MQ135", "MQ6", "MQ3_1"
        ]
        print("MeasurementBuffer initialized")

    def add_reading(self, timestamp, sensor_values):
        """Add a reading to the buffer"""
        # Format timestamp as "HH:MM:SS"
        formatted_time = timestamp if isinstance(timestamp, str) else timestamp.strftime("%H:%M:%S")
        
        # Create ordered list of sensor values
        values = []
        for sensor in self.sensor_order:
            value = sensor_values.get(sensor)
            if value is not None:
                # Format float values to 2 decimal places
                values.append(f"{float(value):.2f}")
            else:
                values.append("")
        
        # Combine time and values
        reading = [formatted_time] + values
        self.buffer.append(reading)
        
        print(f"Added reading to buffer: Time={formatted_time}, Values count={len(values)}")
        if len(self.buffer) % 10 == 0:  # Print every 10th reading
            print(f"Current buffer size: {len(self.buffer)}")

    def get_csv_content(self):
        """Generate CSV content from buffer"""
        if not self.buffer:
            print("Warning: Buffer is empty when generating CSV")
            return ""
            
        # Create header
        header = "time," + ",".join(self.sensor_order)
        
        # Create data rows
        rows = [",".join(reading) for reading in self.buffer]
        
        # Combine header and rows
        csv_content = header + "\n" + "\n".join(rows)
        
        print(f"Generated CSV with {len(self.buffer)} rows")
        print("CSV Header:", header)
        if self.buffer:
            print("First row:", self.buffer[0])
            print("Last row:", self.buffer[-1])
            
        return csv_content

    def clear(self):
        """Clear the buffer"""
        print(f"Clearing buffer (had {len(self.buffer)} readings)")
        self.buffer = []