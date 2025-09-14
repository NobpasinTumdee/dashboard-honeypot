import React, { useState } from 'react';
import './CowrieLogTerminal.css';
import type { CowrieLog } from '../../types';

interface CowrieLogTerminalProps {
  logs: CowrieLog[];
}

const CowrieLogTerminal: React.FC<CowrieLogTerminalProps> = ({ logs }) => {
  // Sort the logs by ID in ascending order
  const sortedLogs = [...logs].sort((a, b) => a.id - b.id);


  const [protocolFilter, setProtocolFilter] = useState("");


  const filteredData = sortedLogs.filter((item) =>
    protocolFilter
      ? (item.timestamp && item.timestamp.slice(0, 10) === protocolFilter.slice(0, 10))
      : true
  );


  const renderLogEntry = (log: CowrieLog) => {
    switch (log.eventid) {
      case 'cowrie.session.connect':
        return (
          <>
            <div className="terminal-line">
              <span className="terminal-system-info" style={{ color: '#27c93f' }}>
                [+] New SSH connection from {log.src_ip}
              </span>
            </div>
            <div className="terminal-line">
              <span className="terminal-system-info">
                [+] Use Protocol: <b style={{ color: `${log.protocol === 'ssh' ? 'red' : 'blue'}` }}>{log.protocol}</b>
              </span>
            </div>
          </>
        );
      case 'cowrie.client.version':
        return (
          <div className="terminal-line">
            <span className="terminal-system-info">
              [*] Client version: {log.message}
            </span>
          </div>
        );
      case 'cowrie.login.success':
        return (
          <div className="terminal-line">
            <span className="terminal-system-info">
              [+] Login successful for user '{log.username}'
            </span>
            <div className="terminal-line">
              <span className="terminal-prompt">
                <span className="terminal-user">{log.username}</span>
                <span className="terminal-at">@</span>
                <span className="terminal-host">UbuntuServer</span>
                <span className="terminal-colon">:</span>
                <span className="terminal-path">~</span>
                <span className="terminal-dollar">$</span>
              </span>
              <span className="terminal-command">Hello, my name is <b>{log.username}</b>. I'm a nefarious person.</span>
            </div>
          </div>
        );
      case 'cowrie.command.input':
        return (
          <div className="terminal-line">
            <span className="terminal-prompt">
              <span className="terminal-user">cowrie</span>
              <span className="terminal-at">@</span>
              <span className="terminal-host">UbuntuServer</span>
              <span className="terminal-colon">:</span>
              <span className="terminal-path">~</span>
              <span className="terminal-dollar">$</span>
            </span>
            <span className="terminal-command">{log.input}</span>
          </div>
        );
      case 'cowrie.command.failed':
        return (
          <div className="terminal-line">
            <span className="terminal-error">
              bash: {log.input}: command not found
            </span>
          </div>
        );
      case 'cowrie.session.closed':
        return (
          <>
            <div className="terminal-line">
              <span className="terminal-system-info">
                [+] Session closed after {log.duration} seconds.
              </span>
            </div>
            <div className="terminal-line" style={{ marginBottom: '3rem' }}>
              <span className="terminal-system-info" style={{ color: 'red' }}>
                [-] ========================== Session closed ========================== [-]
              </span>
            </div>
          </>
        );
      case 'cowrie.log.closed':
        return (
          <>
            <div className="terminal-line">
              <span className="terminal-system-info">
                [+] log closed after {log.duration} seconds.
              </span>
            </div>
            <div className="terminal-line">
              <span className="terminal-system-info" style={{ color: 'yellow' }}>
                [-] ============================ log closed ============================ [-]
              </span>
            </div>
          </>
        );
      default:
        // Render other events as general system info to keep the flow
        return (
          <div className="terminal-line">
            <span className="terminal-system-info">
              [*] Event: {log.eventid} {log.message && `- ${log.message}`}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-dot red"></div>
        <div className="terminal-dot yellow"></div>
        <div className="terminal-dot green"></div>
        <span className="terminal-title-attacker">bash - Cowrie Logs Playback</span>
        <input type="date" onChange={(e) => setProtocolFilter(e.target.value)} style={{ padding: '2px 5px', borderRadius: '5px' }} />
      </div>
      <div className="terminal-body">
        {filteredData.length === 0 ? (
          <div className="terminal-line" key="no-logs-found" style={{ textAlign: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 -960 960 960" width="100px" fill="var(--terminal-header)"><path d="M160-240v-480 188-28 320Zm268 80H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v165q-17-18-37-32t-43-25v-108H447l-80-80H160v480h243q3 21 9.5 41t15.5 39Zm252-320q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480Zm-20 320h40v-160h-40v160Zm20-200q8 0 14-6t6-14q0-8-6-14t-14-6q-8 0-14 6t-6 14q0 8 6 14t14 6Z" /></svg>
            <p>No logs today.</p>
          </div>
        ) : (
          filteredData.map((log, index) => (
            <React.Fragment key={index}>
              {renderLogEntry(log)}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default CowrieLogTerminal;