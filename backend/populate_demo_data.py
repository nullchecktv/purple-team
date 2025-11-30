#!/usr/bin/env python3
"""
Script to populate demo data for the Chicken Hatching Management System
Run this after deploying the backend to populate initial data
"""

import json
import requests
import time
from datetime import datetime, timedelta

# Update this with your actual API Gateway URL after deployment
API_BASE_URL = "https://your-api-id.execute-api.us-east-1.amazonaws.com"

def register_demo_eggs():
    """Register some demo eggs"""
    
    demo_eggs = [
        {
            "breed": "Rhode Island Red",
            "shell_color": "brown",
            "weight": 58.2,
            "shell_thickness": 0.35,
            "age_of_hen": 12,
            "health_status": "excellent",
            "parental_lineage": "Champion Bloodline A x Premium Stock B"
        },
        {
            "breed": "Leghorn",
            "shell_color": "white", 
            "weight": 55.8,
            "shell_thickness": 0.33,
            "age_of_hen": 10,
            "health_status": "excellent",
            "parental_lineage": "Elite White Line x Production Plus"
        },
        {
            "breed": "Plymouth Rock",
            "shell_color": "brown",
            "weight": 61.5,
            "shell_thickness": 0.37,
            "age_of_hen": 14,
            "health_status": "good",
            "parental_lineage": "Heritage Stock x Modern Hybrid"
        }
    ]
    
    registered_eggs = []
    
    for egg_data in demo_eggs:
        try:
            # Generate full metadata
            metadata = {
                **egg_data,
                "circumference": 15.8,
                "genetic_markers": ["productivity", "disease_resistance"],
                "shell_texture": "smooth",
                "candling_results": "normal",
                "nutrition_score": 8.5,
                "collection_date": (datetime.now() - timedelta(days=1)).isoformat().split('T')[0],
                "storage_conditions": "optimal",
                "transport_method": "careful_handling",
                "ambient_temperature": 22.0,
                "humidity_level": 65.0,
                "air_quality_index": 8.5,
                # Add all other required fields with defaults
                "magnetic_field_strength": 0.00005,
                "lunar_phase_at_collection": "waxing_gibbous",
                "solar_activity": "moderate",
                "barometric_pressure": 1013.25,
                "wind_direction": "southwest",
                "cosmic_radiation_level": 0.001,
                "electromagnetic_interference": 0.02,
                "gravitational_anomalies": 0.0,
                "ph_level": 7.2,
                "mineral_content": 8.7,
                "protein_density": 12.8,
                "fat_composition": 10.5,
                "vitamin_levels": 9.2,
                "enzyme_activity": 8.9,
                "hormone_levels": 7.8,
                "stress_indicators": 2.1,
                "fertility_markers": 9.4,
                "shell_porosity": 0.12,
                "membrane_thickness": 0.065,
                "air_cell_size": 6.2,
                "yolk_color": "golden_yellow",
                "albumen_quality": 9.1,
                "shell_strength": 45.2,
                "surface_texture": "slightly_rough",
                "weight_distribution": "balanced",
                "center_of_gravity": "optimal",
                "rotational_inertia": 0.85,
                "acoustic_properties": "resonant",
                "thermal_conductivity": 0.58
            }
            
            response = requests.post(
                f"{API_BASE_URL}/api/eggs",
                json={"metadata": metadata},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                registered_eggs.append(result)
                print(f"✅ Registered egg: {result['egg_id']}")
            else:
                print(f"❌ Failed to register egg: {response.text}")
                
        except Exception as e:
            print(f"❌ Error registering egg: {e}")
        
        # Small delay between registrations
        time.sleep(0.5)
    
    return registered_eggs

def generate_environmental_data():
    """Generate some environmental readings"""
    
    try:
        # Trigger environmental data collection
        response = requests.post(
            f"{API_BASE_URL}/api/environment/readings",
            json={"action": "collect_readings"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Generated environmental reading")
        else:
            print(f"❌ Failed to generate environmental data: {response.text}")
            
    except Exception as e:
        print(f"❌ Error generating environmental data: {e}")

def main():
    print("🐣 Populating Chicken Hatching Management System with demo data...")
    print(f"📡 API Base URL: {API_BASE_URL}")
    print()
    
    # Register demo eggs
    print("🥚 Registering demo eggs...")
    eggs = register_demo_eggs()
    print(f"✅ Registered {len(eggs)} demo eggs")
    print()
    
    # Generate environmental data
    print("🌡️ Generating environmental data...")
    generate_environmental_data()
    print()
    
    print("🎉 Demo data population complete!")
    print()
    print("You can now:")
    print("- View eggs in the dashboard")
    print("- Monitor environmental conditions")
    print("- Test AI predictions")
    print("- Generate blockchain certificates")

if __name__ == "__main__":
    main()