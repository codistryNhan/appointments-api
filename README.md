# appointments-api
A backend REST api to manage doctor's appointments

## Requirements
1. GET to retrieve a list of doctors names
2. GET to retrieve a doctors appointment by day
3. DELETE to delete an appointment
4. POST create an appointment for a doctor

## Data Models
Doctors = {
  id: int,
  first_name: string,
  last_name: string,
}

Appointments = {
  id: int,
  date: date,
  patient : id int
  doctor: id int,
  type: string
}
