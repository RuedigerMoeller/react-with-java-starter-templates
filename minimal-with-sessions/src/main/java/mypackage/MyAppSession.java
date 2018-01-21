package mypackage;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.IPromise;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.remoting.base.RemotedActor;

public class MyAppSession extends Actor<MyAppSession> implements RemotedActor {

    private String userName;
    private String pwd;
    private MyAppServer app;

    @Local
    public void init(String name, String pwd, MyAppServer app) {
        this.app = app;
        this.userName = name;
        this.pwd = pwd;
    }

    public IPromise greetSession() {
        return new Promise("Greetz from session of user "+userName);
    }

    @Override
    public void hasBeenUnpublished(String connectionIdentifier) {
        // cleanup if necessesary
    }

    @Override
    public void hasBeenPublished(String connectionIdentifier) {
        // associate user identity with sessionid for resurrection
        app.registerSessionData(connectionIdentifier,userName,pwd);
    }
}
