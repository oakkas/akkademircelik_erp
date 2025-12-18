import pandas as pd
import os
import glob

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'

def inspect_files():
    files = glob.glob(os.path.join(DATA_DIR, '*.*'))
    excel_files = [f for f in files if f.endswith(('.xls', '.xlsx'))]
    
    print(f"Found {len(excel_files)} Excel files.")
    
    for file_path in excel_files:
        print(f"\n{'='*50}")
        print(f"Inspecting: {os.path.basename(file_path)}")
        print(f"{'='*50}")
        
        try:
            # Try reading with default engine first, then openpyxl/xlrd if needed
            if file_path.endswith('.xlsx'):
                df = pd.read_excel(file_path, engine='openpyxl', nrows=5)
            else:
                df = pd.read_excel(file_path, engine='xlrd', nrows=5)
                
            print(f"Columns: {list(df.columns)}")
            print("\nFirst 3 rows:")
            print(df.head(3).to_string())
            
        except Exception as e:
            print(f"ERROR reading {os.path.basename(file_path)}: {e}")

if __name__ == "__main__":
    inspect_files()
