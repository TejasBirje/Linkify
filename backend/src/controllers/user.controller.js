import FriendRequest from "../models/friendrequest.model.js";
import User from "../models/user.model.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // exclude yourself
                { _id: { $nin: currentUser.friends } }, // exclude your friends
                { isOnboarded: true }  // only get onboarded users
            ]
        });

        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.log("Error in getRecommendedUsers controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.log("Error in getMyFriends controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
/* 

    getMyFriends() explained: 

    1)findById() gets the user document.
    2) .select("friends") limits the fields returned to just the friends array.
    3) .populate("friends", ...) replaces each friend's ID with their actual user object, but only with selected fields:
        fullName
        profilePic
        nativeLanguage
        learningLanguage
This gives you a fully expanded list of friends with useful info, not just raw IDs.

*/

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId } = req.params;

        // prevent sending request to yourself
        if (!myId === recipientId) {
            return res.status(400).json({ message: "You cannot send request to yourself" });
        }

        // check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        // check if recipient is already your friend
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with them" });
        }

        // check if a request is already sent
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },  // the request I sent to them
                { sender: recipient, recipient: myId }  // the request they sent to me 
            ]
        })

        if (existingRequest) {
            return res.status(400).json({ message: "You have already sent this user a friend request" });
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);

    } catch (error) {
        console.log("Error in sendFriendRequest controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) return res.status(404).json({ message: "Friend request not found" });

        // check whether the current user is the recipient
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this request" })
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // now update the friends array of both users
        // add each user to the other's friends array
        // $addToSet: adds elements to an array only if they do not already exists
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient },
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });

        res.status(200).json({ message: "Friend Request Accepted" });
    } catch (error) {
        console.log("Error in acceptFriendRequest controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        // Get all incoming friend requests sent to the current user that are still pending
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,     // the logged-in user is the recipient
            status: "pending",          // status is still pending
        }).populate(
            "sender",                   // populate the sender's details
            "fullName profilePic nativeLanguage learningLanguage"  // only select these fields
        );

        // Get all friend requests sent by the current user that have been accepted
        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,        // the logged-in user is the sender
            status: "accepted",         // status is accepted
        }).populate(
            "recipient",                // populate the recipient's details
            "fullName profilePic"       // only select these fields
        );

        // Respond with both types of requests
        res.status(200).json({ incomingReqs, acceptedReqs });

    } catch (error) {
        console.log("Error in getPendingFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        // Find all friend requests sent by the current user that are still pending
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,       // current user is the sender
            status: "pending",         // only include pending requests
        }).populate(
            "recipient",               // populate recipient's user details
            "fullName profilePic nativeLanguage learningLanguage" // select these fields only
        );

        // Send the list of outgoing friend requests in the response
        res.status(200).json(outgoingRequests);

    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
