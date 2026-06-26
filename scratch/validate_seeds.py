import os
import sys

def validate_sample_files():
    samples_dir = "/Users/nitinagga/Documents/itacs-ai/frontend/public/samples"
    
    print("🛡️ Running Ingestion Mock Asset Integrity Audit...")
    
    files_to_check = {
        "DTC_Consumer_Ad_Campaign.txt": {
            "required_keywords": ["DTC", "Consumer", "directly targeting melanoma patients", "social platforms"],
            "forbidden_keywords": ["Medical Affairs Dissemination Strategy"]
        },
        "V940_Ambitious_Forecast.txt": {
            "required_keywords": ["Ambitious", "100%", "complete market capture", "zero operational barriers"],
            "forbidden_keywords": ["logistics are highly challenging", "adoption will be gradual"]
        },
        "KEYNOTE-940_Logistics_Brief.txt": {
            "required_keywords": ["logistics", "community sites", "-70C freezers", "care coordinators"],
            "forbidden_keywords": ["100% first-line standard-of-care status", "complete market capture"]
        }
    }
    
    errors = 0
    for filename, rules in files_to_check.items():
        filepath = os.path.join(samples_dir, filename)
        if not os.path.exists(filepath):
            print(f"❌ ERROR: File {filename} does not exist!")
            errors += 1
            continue
            
        with open(filepath, 'r') as f:
            content = f.read()
            
        print(f"🔹 Auditing {filename}...")
        
        # Check required keywords
        for keyword in rules["required_keywords"]:
            if keyword.lower() not in content.lower():
                print(f"  ❌ FAIL: Missing required strategic keyword '{keyword}'")
                errors += 1
            else:
                print(f"  ✅ PASS: Found keyword '{keyword}'")
                
        # Check forbidden keywords
        for keyword in rules["forbidden_keywords"]:
            if keyword.lower() in content.lower():
                print(f"  ❌ FAIL: Found forbidden/crossed strategic keyword '{keyword}'")
                errors += 1
            else:
                print(f"  ✅ PASS: Forbidden keyword '{keyword}' is absent")
                
    if errors == 0:
        print("\n🏆 INTEGRITY AUDIT PASSED: All mock slide assets contain correct, distinct strategic contents!")
        sys.exit(0)
    else:
        print(f"\n❌ INTEGRITY AUDIT FAILED: Found {errors} asset synchronization errors.")
        sys.exit(1)

if __name__ == "__main__":
    validate_sample_files()
