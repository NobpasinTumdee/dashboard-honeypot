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

def run_setfacl_commands():
    commands = [
        "sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs",
        "sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs/etc/passwd",
        "sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs/etc/group",
        "sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs/home"
    ]
    
    print("\n>>> Applying setfacl permissions...")
    for cmd in commands:
        try:
            print(f"Running command: {cmd}")
            subprocess.run(cmd.split(), check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error running command '{cmd}': {e}")
            print("Failed to apply all permissions. Please check your sudo setup.")
            sys.exit(1)
    print("--- Finished applying setfacl permissions ---")

if __name__ == "__main__":
    scripts = [
        "GenUsers.py",
        "etcFile.py",
        "NewTimeStamp.py"
    ]

    for s in scripts:
        run_script(s)

    run_setfacl_commands()

    print("\nAll scripts executed successfully.")
