import { StreamChat } from "stream-chat"
import { config } from "dotenv";

config();

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if(!apiSecret || !apiKey) {
    console.log("Stream API key or secret is missing");
};

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// upsert -> word means update, or, if doesn't exist, create.

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting stream user: ", error);
    }
};

export const generateStreamToken = async (userId) => {
    //TODO:
}