import subprocess
import sys

def run_script(script):
    try:
        print(f"\n>>> Running {script}")
        subprocess.run([sys.executable, script], check=True)
        print(f"--- Finished {script} ---")
    except subprocess.CalledProcessError as e:
        print(f"Error while running {script}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    scripts = [
        "GenUsers.py",
        "etcFile.py",
        "NewTimeStamp.py"
    ]

    for s in scripts:
        run_script(s)

    print("\nAll scripts executed successfully.")
