import React, { memo } from "react";
import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import firebase from "../firebase/config";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { useSession } from "../firebase/UserProvider";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SidebarData";
import "../styles/Sidebar.css";
import { IconContext } from "react-icons";

// import {resetPrivilages} from '../firebase/UserProvider';
export default memo(function Header(props) {
  const [menu, setMenu] = useState(false);
  const history = useHistory();
  const [profileNavMenuDropdown, setProfileMenuDropdown] = useState(false);
  //   const toggleMenu = () => {
  //     setMenu(!menu);
  //   };

  const { user } = useSession();

  const privilages = GetUserPrivilages();

  const signOutUser = () => {
    firebase.auth().signOut();
    setProfileMenuDropdown(false);
    history.push("/login");
  };

  const toggleProfileNavMenuDropdown = () => {
    setProfileMenuDropdown(!profileNavMenuDropdown);
  };

  //   const toggleDonorNavMenuDropdown = () => {
  //     setDonorNavMenuDropdown(!donorNavMenuDropdown);
  //   };
  const showMenu = `collapse navbar-collapse ml-5 ${menu ? "show" : ""}`;

  useEffect(() => {
    if (profileNavMenuDropdown) {
      setProfileMenuDropdown(false);
    }
    return () => {
      if (profileNavMenuDropdown) {
        setProfileMenuDropdown(false);
      }
    };
  }, []);
  return (
    // <div>
    //     <nav className="navbar navbar-expand-md bg-white navbar-dark">
    //         <div><Link to="/login">Logo</Link></div>
    //         <button className="navbar-toggler" type="button" onClick={toggleMenu}>
    //             <span className="navbar-toggler-icon"></span>
    //         </button>
    //         <div className={showMenu} id="collapsibleNavbar">
    //             <div className="row w-100">
    //                 <div className="col-3">
    //                     {!!user &&
    //                         <ul className="navbar-nav ">
    //                             <li className="nav-item">
    //                                 <Link className="nav-link text-dark" to="/home">Home</Link>
    //                             </li>
    //                             {
    //                                 privilages.canAccessDMS &&
    //                                 <li className="nav-item">
    //                                     <Link className="nav-link  text-dark" to="/donorsearch">Donor Management System</Link>
    //                                 </li>
    //                             }

    //                             <li className="nav-item">
    //                             <Link className="nav-link  text-dark" to="/donordetails/4OkDMxz6QjYNgPF710jE">Donor Details</Link>
    //                             </li>
    //                         </ul>
    //                 }
    //                 </div>
    //                 <div className="col-6 text-center display-1"><h1>The Title here</h1></div>

    //                 <div className="col-3  text-dark text-right">
    //                     <button className="btn brn-link">
    //                         <img src={user ? user.photoURL : ''} className="rounded-circle" style={{height: '32px'}} />
    //                     </button>
    //                     <div id="profileImageMenu" className='collapse navbar-collapse'>

    //                     </div>
    //                     {!!user &&
    //                     <button className="btn btn-link  text-dark" onClick = {signOutUser} >Logout</button>}
    //                     </div>
    //             </div>

    //         </div>
    //     </nav>
    // </div>
    <>
      <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow row">
        <div className="col-md-3 col-sm-3">
          <Link className="navbar-brand mr-0 px-3" to="\">
            LOGO
          </Link>
        </div>
        <div className="col-md-6 col-sm-6">
          <div>
            <h1 class="w-100 text-white text-center">
              {process.env.REACT_APP_APP_TITLE}
            </h1>
          </div>
        </div>
        <div className="col-md-3 col-sm-3">
          {user && (
            <div
              className={`float-right ${profileNavMenuDropdown ? "show" : ""}`}
            >
              <button
                className="btn brn-link pr-3 dropdown-toggle"
                type="button"
                onClick={toggleProfileNavMenuDropdown}
                aria-expanded={profileNavMenuDropdown}
              >
                <img
                  src={user ? user.photoURL : ""}
                  className="rounded-circle"
                  style={{ height: "32px" }}
                />
              </button>

              <div
                className={`bg-dark dropdown-menu dropdown-menu-right ${
                  profileNavMenuDropdown ? "show" : ""
                }`}
              >
                <ul class="navbar-nav">
                  <li class={`nav-item text-nowrap dropdown-item `}>
                    <button class="btn btn-link " onClick={signOutUser}>
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* <button
          type="button"
          aria-label="Toggle Navigation"
          className="navbar-toggler position-absolute d-md-none collapsed"
          onClick={toggleNavigation}
        >
          <FaIcons.FaBars onClick={showSidebar} />
        </button> */}
      </nav>
    </>
  );
});
