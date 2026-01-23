# 🚚 Transport & Delivery Management System

A comprehensive web application for managing transport company operations, built with Django.

## Overview
Academic project for **Information Systems 2** module. This system handles complete logistics management including shipment tracking, driver assignment, invoicing, and real-time analytics.
## Documentation
Full documentation available in /docs/ folder.




## Key Features

| Module | Description |
|--------|-------------|
| **Favorites** | Personalized quick-access dashboard |
| **Tables Management** | CRUD operations for Clients, Drivers, Vehicles, Destinations |
| **Shipment Tracking** | End-to-end package tracking with automatic cost calculation |
| **Route Planning** | Tour management with driver and vehicle assignment |
| **Invoicing** | Automatic invoice generation with VAT (19%) |
| **Analytics Dashboard** | Charts and reports for business insights |
| **Incident Management** | Issue tracking and resolution system |

## Technology Stack
- **Backend:** Django 5.1+ (Python)
- **Database:** PostgreSQL (development: SQLite)
- **Frontend:** HTML5, CSS3, JavaScript
- **Documentation:** LaTeX
- **Version Control:** Git

## Quick Installation

### Prerequisites
- Python 3.9+
- Django

### Setup Instructions
```bash
# 1. Clone repository
git clone https://github.com/your-username/transport-system.git
cd transport-system

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Run development server
python manage.py runserver
