import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { Link, useLocation } from 'react-router';
import { BellIcon, LogOutIcon, Waypoints } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import useLogout from '../hooks/useLogout';

const Navbar = () => {

  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  // const queryClient = useQueryClient();

  // const { mutate: logoutMutation, error } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"]}),
  // })

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">

          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <Waypoints className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Linkify
                </span>
              </Link>
            </div>
          )}

          {/* RIGHT SIDE ITEMS WITH PROPER SPACING */}
          <div className="flex items-center space-x-3">
            {/* NOTIFICATIONS BUTTON */}
            <Link to={"/notifications"}>
              <button className="btn btn-circle">
                <BellIcon className="h-5 w-5 text-base-content opacity-70" />
              </button>
            </Link>

            {/* THEME SELECTOR */}
            <div className="mx-2">
              <ThemeSelector />
            </div>

            {/* PROFILE PIC */}
            <div className="avatar mx-2">
              <div className="w-7 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>

            {/* LOGOUT BUTTON */}
            <button className="btn btn-circle" onClick={logoutMutation}>
              <LogOutIcon className="h-5 w-5 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar