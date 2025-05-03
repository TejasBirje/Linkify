import React from 'react'
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFriends } from '../lib/api';
import { MapPinIcon, MessageSquareIcon, UserMinusIcon, UsersIcon } from "lucide-react";
import { getLanguageFlag } from '../components/FriendCard';
import NoFriendsFound from '../components/NoFriendsFound';
import { capitalize } from '../lib/utils';
import { Link } from 'react-router';

const FriendsPage = () => {
  const queryClient = useQueryClient();

  // fetch all friends
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Friends</h1>
          <div className="flex items-center gap-3">
            <span className="badge badge-primary text-sm pb-1">
              {friends.length} Friends
            </span>
            <Link to="/notifications" className="btn btn-outline btn-sm">
              <UsersIcon className="mr-2 size-4" />
              Friend Requests
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="card bg-base-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="card-body p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar size-16 rounded-full">
                      <img src={friend.profilePic} alt={friend.fullName} />
                    </div>

                    {/* LOCATION */}
                    <div>
                      <h3 className="font-semibold text-lg">{friend.fullName}</h3>
                      {friend.location && (
                        <div className="flex items-center text-xs opacity-70 mt-1">
                          <MapPinIcon className="size-3 mr-1" />
                          {friend.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* LANGUAGE WITH FLAG */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="badge badge-secondary">
                      {getLanguageFlag(friend.nativeLanguage)}
                      Native: {capitalize(friend.nativeLanguage)}
                    </span>
                    <span className="badge">
                      {getLanguageFlag(friend.learningLanguage)}
                      Learning: {capitalize(friend.learningLanguage)}
                    </span>
                  </div>

                  {/* BIO */}
                  {friend.bio && <p className="text-sm opacity-80">{friend.bio}</p>}

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2">
                    <button className="btn flex-1 btn-primary">
                      <MessageSquareIcon className="size-5 mr-2" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default FriendsPage;