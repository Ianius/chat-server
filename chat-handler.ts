import { ChatServer, ChatSocket, Chatroom } from "./interfaces";

interface Userdata {
    id: string;
    nickname: string;
    chatroom?: Chatroom;
}

const userdataArray: Userdata[] = [];
const chatrooms: Chatroom[] = [
    {
        name: "General",
        description: "You can chat about anything here!"
    },

    {
        name: "Sports",
        description: "Chat about anything related to sports!",
    },

    {
        name: "Videogames",
        description: "Chat about anything related to videogames!"
    },

    {
        name: "TV & Movies",
        description: "Chat about anything related to TV and movies!"
    }
];

export default (io: ChatServer, socket: ChatSocket) => {
    const setUserdata = (data: Userdata) => {
        const index = userdataArray.findIndex(u => u.id === socket.id);

        if (index > -1)
            userdataArray[index] = data;
        else
            userdataArray.push(data);
    };

    const getUserdata = () => userdataArray.find(u => u.id === socket.id);

    const joinChatroom = (chatroom: Chatroom, userdata: Userdata) => {
        if (socket.rooms.has(chatroom.name)) return;
        if (userdata.chatroom) leaveChatroom(userdata);
        socket.join(chatroom.name);
        socket.to(chatroom.name).emit("userJoinedChatroom", userdata.nickname);
        userdata.chatroom = chatroom;
    };

    const leaveChatroom = (userdata: Userdata) => {
        if (userdata.chatroom) {
            socket.to(userdata.chatroom.name).emit("userLeftChatroom", userdata.nickname);
            socket.leave(userdata.chatroom.name);
            userdata.chatroom = undefined;
        }
    };

    socket.on("setNickname", (nickname, response) => {
        const userWithRequestedNickname = userdataArray.find(u => u.nickname === nickname);

        if (userWithRequestedNickname && userWithRequestedNickname.id === socket.id)
            return response("success");

        if (userWithRequestedNickname)
            return response("unavailable");

        setUserdata({
            id: socket.id,
            nickname: nickname
        });

        return response("success");
    });

    socket.on("getAllChatrooms", callback => callback(chatrooms));

    socket.on("getUsersInChatroom", callback => {
        const userdata = getUserdata();

        if (!userdata) return;

        const usersInChatroom = userdataArray
            .filter(u => u.chatroom === userdata.chatroom)
            .map(u => u.nickname);

        callback(usersInChatroom);
    });

    socket.on("joinChatroom", (name, onSuccess) => {
        // Make sure the requested chatroom exists
        const chatroom = chatrooms.find(room => room.name === name);
        const userdata = getUserdata();

        if (!(chatroom && userdata)) return;

        joinChatroom(chatroom, userdata);

        onSuccess();
    });

    socket.on("sendMessage", (message, onSuccess) => {
        const userdata = getUserdata();
        const chatroom = userdata?.chatroom;
        const nickname = userdata?.nickname;

        if (!(chatroom && nickname && message.length > 0)) return;

        socket.to(chatroom.name).emit("messageSent", nickname, message);
        onSuccess();
    });

    socket.on("disconnect", () => {
        const index = userdataArray.findIndex(u => u.id === socket.id);

        if (index > -1) {
            const userdata = userdataArray[index];
            leaveChatroom(userdata);
            userdataArray.splice(index, 1);
        }
    });
};
