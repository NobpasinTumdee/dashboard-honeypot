# -*- coding: utf-8 -*-
import json
import subprocess
import csv
import os

def scan_ips_and_save(input_file, output_file):
    """
    Reads a JSON file, extracts unique 'src_ip' values,
    runs nmap on each IP, and saves the results to a new JSON file.
    Also writes the same results to a CSV file (same base name as output_file).

    Args:
        input_file (str): The path to the input JSON file (e.g., 'cowrie.json').
        output_file (str): The path to the output JSON file (e.g., 'ScanSrc.json').
    """

    unique_ips = set()
    scan_results = []

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    if 'src_ip' in data:
                        unique_ips.add(data['src_ip'])
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON on line: {line.strip()}. Error: {e}")
        
        print(f"Found {len(unique_ips)} unique IPs to scan.")

    except FileNotFoundError:
        print(f"Error: The file '{input_file}' was not found. Please check the path.")
        return

    for ip in unique_ips:
        print(f"Scanning IP: {ip} with nmap...")
        try:
            nmap_command = ["nmap", "-p", "22", "--script", "vuln", ip]
            result = subprocess.run(
                nmap_command,
                capture_output=True,
                text=True,
                check=True,
                timeout=300
            )
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": result.stdout
            })
            print(f"Scan for {ip} completed successfully.")
        except subprocess.CalledProcessError as e:
            error_message = f"Error running nmap: {e.stderr.strip()}"
            print(f"Scan for {ip} failed. Error: {error_message}")
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": error_message
            })
        except subprocess.TimeoutExpired:
            timeout_message = "Error: Nmap scan timed out."
            print(f"Scan for {ip} timed out.")
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": timeout_message
            })
        except Exception as e:
            generic_error_message = f"An unexpected error occurred: {e}"
            print(f"Scan for {ip} encountered an unexpected error: {e}")
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": generic_error_message
            })

    # Write JSON as before
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(scan_results, f, ensure_ascii=False, indent=4)
        print(f"Results saved to '{output_file}' successfully.")
    except IOError as e:
        print(f"Error writing to file '{output_file}': {e}")
        # If JSON writing fails, still attempt CSV below (optional)

    # Also write CSV (same base name, .csv)
    try:
        base, ext = os.path.splitext(output_file)
        csv_file = f"{base}.csv"

        # Use newline='' to avoid extra blank lines on Windows
        with open(csv_file, 'w', newline='', encoding='utf-8') as csvf:
            writer = csv.writer(csvf, quoting=csv.QUOTE_MINIMAL)
            # header
            writer.writerow(["src_ip", "nmap_scan"])
            for row in scan_results:
                # Ensure nmap_scan remains as a single CSV cell (contains newlines)
                writer.writerow([row.get("src_ip", ""), row.get("nmap_scan", "")])

        print(f"CSV results saved to '{csv_file}' successfully.")
    except IOError as e:
        print(f"Error writing CSV file: {e}")


if __name__ == "__main__":
    input_file_name = '/home/cowrie/cowrie/var/log/cowrie/cowrie.json'
    output_file_name = 'ScanSrc.json'
    scan_ips_and_save(input_file_name, output_file_name)
