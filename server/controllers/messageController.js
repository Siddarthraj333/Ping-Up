import fs from 'fs'
import imagekit from '../configs/imageKit.js';
import Message from '../models/Message.js';



// create an empty object to store ss event connections
const connections = {};

// controller function for the SSE endpoint
export const sseController = (req, res)=>{
    const { userId } = req.params
    console.log('New client connected : ', userId)

    // set SSe headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'Keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // add the clients response object to the connection object
    connections[userId] = res

    // send an initial event to the client
    res.write('log: Connected to SSE stream\n\n');

    // handle client disconnection
    req.one('close', ()=> {
        // remove the clients response object from the connection array
        delete connections[userId];
        console.log('Client disconnected');
    })
}

// send message 
export const sendMessage = async (res, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text';

        if(message_type === 'image'){
            const fileBuffer = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                  file: fileBuffer,
                  fileName: image.originalname,
            });
            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '1280'}
                ]
            })
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        })

        res.json({ success: true, message});

        // send message to to_user_id using SSE

        const messageWithUserData = await Message.findById(message._id).
        populate('from_user_id');

        if(connections[to_user_id]){
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// get chat messages 
export const getChatMessages = async (res, req) =>{
    try {
        const { userId } = req.auth();
        const { to_user_id } = req.body;

        const messages =  await Message.find({
            $or: [
                {from_user_id: userId, to_user_id},
                {from_user_id: to_user_id, to_user_id: userId},
            ]
        }).sort({created_at: -1})
        // mark messages as seen 
        await Message.updateMany({from_user_id: to_user_id, to_user_id:
            userId}, {seen: true})
            res.json({success: true, messages});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getUserRecentMessages = async (req, res) =>{
    try {
        const { userId } = req.auth();
        const messages = await Message.find({to_user_id: userId}.populate
            ('from_user_id to_user_id')).sort({created_at: -1});

            res.json({success: true, messages});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}