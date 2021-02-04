import React, { memo } from 'react'
import { useSession } from '../firebase/UserProvider';
import logo from '../img/BMSLogo.jpg';
export default memo(function Home() {

    const {user} = useSession();
    
    return (
        <div>
            <div id="home">
            <h2 className="text-center text-blue pt-5">Welcome Home!</h2>
            <div className="container">
                <div id="login-row" className="row justify-content-center align-items-center">
                    <div id="login-column" className="col-md-6">
                        <div id="login-box" className="col-md-12 justify-content-center d-flex">
                            {!!user && <div> Welcome {user.displayName}</div>}
                        </div>
                        <div className="justify-content-center d-flex">
                                {!!user && <div><img src={user.photoURL} alt="Profile" className="rounded-circle img-thumbnail img-fluid"/>
                                 {/* <img src={logo} alt='BMS Logo' /> */}
                                 </div>
                                }
                            </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
})
