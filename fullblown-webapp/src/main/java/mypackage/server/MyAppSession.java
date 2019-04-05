package mypackage.server;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.Callback;
import org.nustaq.kontraktor.annotations.CallerSideMethod;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.apputil.ImageHandlingMixin;
import org.nustaq.kontraktor.apputil.SessionEvent;
import org.nustaq.kontraktor.apputil.SessionHandlingSessionMixin;
import org.nustaq.kontraktor.apputil.UserRecord;
import org.nustaq.kontraktor.apputil.comments.CommentsSessionMixin;
import org.nustaq.kontraktor.remoting.base.RemotedActor;
import org.nustaq.kontraktor.services.rlclient.DataClient;
import org.nustaq.kontraktor.util.Log;
import org.nustaq.reallive.api.Record;
import org.nustaq.reallive.api.Subscriber;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

public class MyAppSession extends Actor<MyAppSession> implements RemotedActor, SessionHandlingSessionMixin, ImageHandlingMixin, CommentsSessionMixin {

    private UserRecord user;
    private MyAppServer app;
    private List<Subscriber> subscriptions;
    private Callback uiSubscription; // pipe stuff to ui client
    private int sessionIntId; // provided for uniquesession id mixin

    @Local
    public void init(UserRecord user, MyAppServer app, Callback uiSubscription ) {
        this.app = app;
        this.user = user;
        subscriptions = new ArrayList<>();
        this.uiSubscription = uiSubscription;
        AtomicBoolean initialDataDone = new AtomicBoolean(false);
        subscribeUserRecord(user, uiSubscription, initialDataDone);
        subscriptions.add(listenCommentHistory( (change,err) -> {
            if ( change != null ) {
                // Broadcast Id of changed discussion so UI may reload.
                // this is inefficient in case of a large number of users.
                // for those scenarios an incremental update of a discussion should be implemented
                // DO NOT FORWARD commentHistory change to UI, else all communication of all users is exposed to
                // each client

                // FIXME: still a privacy issue as valid discussion id's get broadcasted. Should be filtered here to ensure user is allowed to see this discussion
                Record record = change.getRecord();
                if ( record != null ) {
                    if ( uiSubscription != null )
                        uiSubscription.pipe( new SessionEvent("discussionChange", record ) );
                    else
                        Log.Error(this,"uiSubscription is null "+user);
                }
            }
            else
                Log.Error(this,"SessionEvent Error:"+err);
        }));
    }

    @Override
    public void hasBeenUnpublished(String connectionIdentifier) {
        // cleanup if necessesary
        subscriptions.forEach( subs -> getDClient().unsubscribe(subs.getId()));
    }

    @Override
    public void hasBeenPublished(String connectionIdentifier) {
        // associate user identity with sessionid for resurrection
        app.registerSessionData(connectionIdentifier,user.getName(),user.getPwd());
    }

    ////////////////// Accessors for Mixin's //////////////////////////////////////////////////

    @Override @CallerSideMethod @Local
    public DataClient getDClient() {
        return getActor().app.getDClient();
    }

    @Override @CallerSideMethod @Local
    public UserRecord getUser() {
        return getActor().user;
    }

    @Override @CallerSideMethod @Local
    public List<Subscriber> getSubscriptions() {
        return getActor().subscriptions;
    }

    @Override @CallerSideMethod
    public int _getUnqiqueIntSessionId() {
        return getActor().sessionIntId;
    }

    @Override @CallerSideMethod
    public void _setUnqiqueInSessionId(int id) {
        getActor().sessionIntId = id;
    }
}
