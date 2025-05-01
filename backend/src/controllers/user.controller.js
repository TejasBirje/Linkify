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

        if(existingRequest) {
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