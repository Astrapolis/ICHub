import Array "mo:base/Array";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor {
    public type Message = { 
        time:Time.Time; text:Text; author:Text};

    public type Blogger = {
        id: Principal; name: Text
    };

    public type Microblog = actor {
        follow: shared(Principal) -> async ();
        unfollow: shared(Principal) -> async ();
        follows: shared query () -> async [Blogger];
        clearFollows: shared () -> async ();
        post: shared(Text) -> async ();
        posts: shared query (Time.Time) -> async [Message];
        timeline: shared (Time.Time) -> async [Message];
        set_name: shared (Text) -> async ();
        get_name: shared query () -> async ?Text;
    };

    stable var authorName : ?Text = null;
    stable var postList = List.nil<Message>();
    stable var followList = List.nil<Principal>();

    public shared (mes) func set_name(text:Text) : async () {
        
        authorName := ?text;
        
    };

    public query func get_name() : async ?Text {
        authorName;
    };

    public shared (mes) func post(text:Text) : async () {
        // assert(Principal.toText(mes.caller) == "2al2t-2jbuy-tn5re-ay3mw-aimky-hqdgv-3rjgx-eepq2-yjkeb-bvxrl-hae");
        var currentName: Text = "<unknown>";
        switch(authorName) {
            case null {
                
            };
            case (?authorName) {
                currentName := authorName;
            };
        };
        let msg:Message = {time = Time.now(); text; author=currentName;};
        postList := List.push<Message>(msg, postList);
        
    };

    public query func posts(time: Time.Time): async [Message] {
        let matchedList:List.List<Message> = List.filter<Message>(postList, func (msg: Message) {
            msg.time >= time;
        });
        if (List.isNil(matchedList)) {
            return [];
        };
        var currentName: Text = "<unknown>";
        switch(authorName) {
            case null {
                
            };
            case (?authorName) {
                currentName := authorName;
            };
        };
        List.toArray<Message>(List.tabulate<Message>(List.size<Message>(matchedList), func (index: Nat) {
            let msg = List.get<Message>(matchedList, index);
            switch(msg) {
                case (null) {
                    return {
                        time = 0;
                        text = "<empty>";
                        author = currentName;
                    };
                };
                case (?msg) {
                    return {
                        time = msg.time;
                        text = msg.text;
                        author = currentName;
                    };
                };
            };
            
        }));
    };
    
    public func unfollow(id:Principal) {
        var subList:List.List<Principal> = List.filter<Principal>(followList, func (checkedId:Principal) {
            checkedId != id;
        });
        
            switch(subList) {
                case (null) {

                };
                case (?subList) {
                    followList := List.nil<Principal>();
                    
                    List.iterate<Principal>(?subList, func (pid:Principal) {
                        followList := List.push<Principal>(pid, followList);
                    });
                    
                    // followList := List.tabulate<Principal>(List.size<Principal>(subList), func (index:Nat){
                    //     let pid = List.get<Principal>(subList, index);
                    //     switch (pid) {
                    //         case (null) {
                    //             return Principal.fromText("");
                    //         };
                    //         case (?pid) {
                    //             return pid;
                    //         }
                    //     }
                    // });
                };
            };
        
    };

    public func follow(id:Principal) {
        let bingo = List.find<Principal>(followList, func (checkId:Principal) {
            checkId == id;
        });
        switch(bingo) {
            case (null) {
                followList := List.push<Principal>(id, followList);
            };
            case (?bingo) {

            };
        };
    };

    public func follows(): async [Blogger] {
        var all: List.List<Blogger> = List.nil();
        if (List.isNil(followList)) {
            return [];
        };
        for (pid in Iter.fromList(followList)) {
            let canister: Microblog = actor(Principal.toText(pid));
            let author = await canister.get_name();
            switch(author) {
                case null {
                    let blogger:Blogger = {id = pid; name = "<unkown>";};
                    all := List.push(blogger, all);
                };
                case (?author) {
                    let blogger:Blogger = {id = pid; name = author;};
                    all := List.push(blogger, all);
                };
            };
            
        };
        
        return List.toArray(all);
    };

    public func clearFollows() {
        followList := List.nil();
        return;
    };

    public func timeline(since: Time.Time): async [Message] {
        var all: List.List<Message> = List.nil();
        if (List.isNil(followList)) {
            return [];
        };
        for (id in Iter.fromList(followList)) {
            let canister: Microblog = actor(Principal.toText(id));
            let msgs = await canister.posts(since);
            // let currentName = await canister.get_name();
            for (msg in Iter.fromArray(msgs)) {
                // msg.author = currentName;
                all := List.push(msg, all);
            };
        };
        

        return List.toArray(all);
    }
};
