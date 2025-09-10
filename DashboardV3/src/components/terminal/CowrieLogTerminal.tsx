import React from 'react';
import './CowrieLogTerminal.css';
import type { CowrieLog } from '../../types';

interface CowrieLogTerminalProps {
  logs: CowrieLog[];
}

const CowrieLogTerminal: React.FC<CowrieLogTerminalProps> = ({ logs }) => {
  // Sort the logs by ID in ascending order
  const sortedLogs = [...logs].sort((a, b) => a.id - b.id);
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
      </div>
      <div className="terminal-body">
        {sortedLogs.map((log, index) => (
          <React.Fragment key={index}>
            {renderLogEntry(log)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CowrieLogTerminal;