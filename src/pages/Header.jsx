import React, { memo } from 'react'
import { useState } from 'react'
import { Link, useHistory } from 'react-router-dom';
import firebase from '../firebase/config';
import { GetUserPrivilages } from '../firebase/UserPrivilageProvider';
import { useSession } from '../firebase/UserProvider';
// import {resetPrivilages} from '../firebase/UserProvider';
export default memo(function Header(props) {
    const[menu, setMenu] = useState(false);
    const history = useHistory();

    const toggleMenu = () => {
        setMenu(!menu);
    }

    const signOutUser = () => {
        firebase.auth().signOut();
        // resetPrivilages()
        history.push("/login");
    }
    const {user} = useSession();

    const privilages = GetUserPrivilages();
    const showMenu = `collapse navbar-collapse ml-5 ${menu ? "show" : ""}`;
    return (
        <div>
            <nav className="navbar navbar-expand-md bg-white navbar-dark">
                <div><Link to="/login">Logo</Link></div>
                <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={showMenu} id="collapsibleNavbar">
                    <div className="row w-100">
                        <div className="col-3">
                            {!!user && 
                                <ul className="navbar-nav ">
                                    <li className="nav-item">
                                        <Link className="nav-link text-dark" to="/home">Home</Link>
                                    </li>
                                    {
                                        privilages.canAccessDMS && 
                                        <li className="nav-item">
                                            <Link className="nav-link  text-dark" to="/donorsearch">Donor Management System</Link>
                                        </li>
                                    }
                                    
                                    <li className="nav-item">
                                    <Link className="nav-link  text-dark" to="/donordetails/4OkDMxz6QjYNgPF710jE">Donor Details</Link>
                                    </li>    
                                </ul>
                        }
                        </div>
                        <div className="col-6 text-center display-1"><h1>The Title here</h1></div>
                        
                        <div className="col-3  text-dark text-right">
                            <button className="btn brn-link">
                                <img src={user ? user.photoURL : ''} className="rounded-circle" style={{height: '32px'}} />
                            </button>
                            <div id="profileImageMenu" className='collapse navbar-collapse'>

                            </div>
                            {!!user &&
                            <button className="btn btn-link  text-dark" onClick = {signOutUser} >Logout</button>}
                            </div>
                    </div>
                    
                </div>  
            </nav>
        </div>
    )
})
