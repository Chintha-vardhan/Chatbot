import User from "../models/user.model.js";
import Message from "../models/message.model.js"

export const getUserForSidebar = async (req, res) => {
    try{
        const loggnedInUserId = req.user._id; 
        const filteredUsers = await User.fing({_id: {$ne:loggnedInUserId}}).select("-password");
        res.status(200).json({filteredUsers});
        
    } catch (error) {
        console.error('Error in getUserForSidebar:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user data',
            error: error.message
        });
    }
   };

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params; 
        const myId = req.user._id; 

    
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId}
            ]
        })
        res.status(200).json(messages);

    } catch (error) {
        console.error('Error in getMessages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve messages',
            error: error.message
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Internal error", error.message);
        res.status(500).json({ message: "Failed to send message", error: error.message });
    }
};