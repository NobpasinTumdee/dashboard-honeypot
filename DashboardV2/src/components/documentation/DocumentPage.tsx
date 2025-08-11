import TerminalCode from './components/terminalcode';
import './Doc.css';

const DocumentPage = () => {
    return (
        <>
            <div className="doc-container">
                <h1 className="doc-title">Documentation Home</h1>
                <p className="doc-subtitle">
                    Welcome to the documentation section. Here you can find guides and tutorials on how to use the dashboard.
                </p>
                <a href="/document/cowrie-guide" className="doc-button">
                    View Cowrie Guide
                </a>
            </div>
            <TerminalCode type='npm' code="echo 'Hello, world!'" />
        </>
    );
}

export default DocumentPage;

