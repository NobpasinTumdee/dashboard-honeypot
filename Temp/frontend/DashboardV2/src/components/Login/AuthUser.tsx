import { useState } from "react"
import { AuthNewUser, type Users } from "../../serviceApi"
import './Login.css'
import { UsersSocket } from "../web-socket/controller"

const AuthUser = () => {
    const [user, setUser] = useState<Users[]>([])
    const [isConnected, setIsConnected] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    // Custom hook to manage WebSocket connection
    UsersSocket(setUser, setIsConnected, setIsLogin);

    const handleAuthUser = async (id: string) => {
        try {
            console.log(id)
            const res = await AuthNewUser(id)
            if (res.status === 200) {
                alert('Change Status User Success')
                window.location.reload();
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className="auth-container">
                <h1 className="auth-title">🛠️ Apply for new membership</h1>
                <p className="auth-subtitle">
                    {isConnected ? (<span className="status-connected">🟢 Connected to server</span>) : (<span className="status-disconnected">🔴 Disconnected from server</span>)}
                    {isLogin ? (<span className="status-login"> | 🔐 Authenticated</span>) : (<span className="status-logout"> | ❌ Not Authenticated</span>)}
                </p>
                {user.length > 0 ? (
                    <div className="user-list">
                        {user.map((item, index) => (
                            <div key={index} className="user-card">
                                <div className="user-info">
                                    <div className="user-avatar-placeholder">
                                        <span className="initials">{item.UserName.charAt(0)}</span>
                                    </div>
                                    <div className="user-details">
                                        <h3 className="user-name">{item.UserName}</h3>
                                        <p className="user-email">📧 {item.Email}</p>
                                        <p className="user-status">Status: <span className={`status-${item.Status?.toLowerCase()}`}>{item.Status ? item.Status : 'unauthorized'}</span></p>
                                    </div>
                                </div>
                                <div className="user-timestamps">
                                    <p>🗓️ Create: {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                                {item.Status !== 'Authenticated' &&
                                    <button
                                        className="auth-button"
                                        onClick={() => handleAuthUser(item.UserID)}
                                    >
                                        approve
                                    </button>
                                }
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-users-message">There are no users pending approval. 😊</p>
                )}
            </div>
        </>
    )
}

export default AuthUser
