# Table of Contents
* [Raspberry Pi Setup](/docs/raspberry_pi_setup.md)
* [Get Started](/docs/Get_Started.md)
### Cowrie
* [Cowrie Installation](/docs/Cowrie.md)
* [Cowrie Plugin Login](/docs/Cowrie_Plugin[1].md)
* [Cowrie Plugin Fake file system](/docs/Cowrie_Plugin[2].md)
* [Cowrie Plugin Create User home directory](/docs/Cowrie_Plugin[2].md)
### OpenCanary
* [OpenCanary Installation](/docs/OpenCanary.md)
* [OpenCanary Plugin Http/Https Mockup](/docs/Opencanary_Plugin[1].md)
### dashboard-honeypot
* [Dashborad Frontend](/docs/Dashboard/Dashboard.md)
* [Dashborad Backend](/docs/Dashboard/Backend.md)


# Graph ระบบโดยรวม
```mermaid
graph LR
A[client] --> B( Web Deployed Version )
A -- ip web server --> C( Web local Server )
B -- web socket --> D(Ngrok url)
B -- Ai ChatBot--> B1(Ollama Model)
C -- web socket --> E
D -- Tunnel Port --> E( Server ubuntu )
E --prisma--> F( SQLite )
F --> G(Honeypot Log)
F --> H(Packet Log)
H --> I(Wirshark)
G --> J( Cowrie )
G --> K( Open Canary )
J --> L1( attacker SSH )
J --> L2( attacker telent )
K --> L3( http )
K --> L4( https )
K --> L5( FTP )
```
