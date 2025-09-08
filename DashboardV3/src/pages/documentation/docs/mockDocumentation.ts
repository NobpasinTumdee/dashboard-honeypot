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

export const mockNavigation: NavigationItem[] = [
    { id: 'home', name: 'Home', href: '/' },
    { id: 'docs', name: 'Documentation', href: '/docs' },
    { id: 'about', name: 'About Us', href: '/about' }
];