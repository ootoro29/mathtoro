import { ChatBody } from "../components/base/ChatBody";
import { GroupsHeader } from "../components/base/GroupsHeader";

export default function Page() {
    return (
        <>
            <GroupsHeader>
                <p style={{fontWeight:"bold",fontSize:20,margin:16}}>ホームページ</p>
            </GroupsHeader>
            <ChatBody>
                chat body
            </ChatBody>
        </>
    );
}