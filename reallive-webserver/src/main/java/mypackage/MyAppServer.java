package mypackage;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.IPromise;
import org.nustaq.kontraktor.Scheduler;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.impl.SimpleScheduler;
import org.nustaq.kontraktor.remoting.base.SessionResurrector;
import org.nustaq.kontraktor.remoting.encoding.SerializerType;
import org.nustaq.kontraktor.remoting.http.undertow.Http4K;
import org.nustaq.kontraktor.services.rlclient.DataClient;
import org.nustaq.kontraktor.util.Log;
import org.nustaq.kontraktor.webapp.javascript.clojure.ClojureJSPostProcessor;
import org.nustaq.kontraktor.webapp.transpiler.JSXIntrinsicTranspiler;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

public class MyAppServer extends Actor<MyAppServer> implements SessionResurrector {

    public static MyAppServerConfig cfg;

    // dummy should be persistent in order to let clients 'survive' server restart
    private Map<String,String[]> mSessionId2UserId;

    // threads to dispatch session onto
    private Scheduler clientThreads[];
    private Random rand = new Random();
    private MyAppServerService service;
    private DataClient dclient;

    @Local
    public void init(String args[]) {
        mSessionId2UserId = new HashMap<>();
        clientThreads = new Scheduler[cfg.getNumSessionThreads()];
        IntStream.range(0,cfg.getNumSessionThreads())
            .forEach( i -> clientThreads[i] = new SimpleScheduler(10000, true /*Important!*/ ));
        service = MyAppServerService.start(args);
        service.setWebServer(self());
        dclient = service.getDClient();
    }

    // public example method (no login required)
    public IPromise greetServer(String who) {
        return resolve("Hello "+who);
    }


    ////////////////////// Session handling //////////////////////////////////////////////


    public IPromise<MyAppSession> login(String username, String pwd ) {
        if ( "".equals(username.trim()) ) {
            return reject("empty username");
        }
        //TODO: verify credentials
        MyAppSession session = AsActor(
            MyAppSession.class,
            // randomly distribute session actors among clientThreads
            clientThreads[rand.nextInt(clientThreads.length)]
        );
        session.init(username,pwd,self());
        return resolve(session); // == new Promise(session)
    }

    /**
     * restore an old session (client has been inactive and "woke up")
     *
     * @param sessionId
     * @param remoteRefId
     * @return
     */
    @Override @Local
    public IPromise<Actor> reanimate(String sessionId, long remoteRefId) {
        // dummy in memory
        String userPwd[] = mSessionId2UserId.get(sessionId);
        if ( userPwd != null ) {
            // create a new session with stored data, client is notified
            // in case it needs to refresh client side data
            Log.Info(this,"reanimated session "+sessionId+" with data "+userPwd[0]);
            return (IPromise)login(userPwd[0],userPwd[1]);
        }
        return resolve(null); // cannot reanimate => client shows "session expired"
    }

    @Local
    public void registerSessionData(String id, String userName, String pwd) {
        //TODO: persist data in order to re-identify "sleeping" clients waking up
        //TODO: clean up / remove old sessionId's to avoid memleak
        mSessionId2UserId.put(id,new String[] {userName,pwd});
    }


    ///////////////////// config and startup ////////////////////////////////////////////


    public static void main(String[] args) {

        if ( ! new File("./src/main/web/index.html").exists() ) {
            System.out.println("Please run with project working dir");
            System.exit(-1);
        }

        MyAppServerConfig cfg = MyAppServerConfig.read("./run/etc/config.kson");
        MyAppServer.cfg = cfg;

        boolean DEVMODE = cfg.isDevMode();

        MyAppServer app = AsActor(MyAppServer.class);

        app.init(args);

        Http4K.Build(cfg.getBindIp(), cfg.getBindPort())
            .resourcePath("/")
                .elements("./src/main/web","./src/main/web/node_modules")
                .transpile("jsx",
                    new JSXIntrinsicTranspiler(DEVMODE)
                        .configureJNPM("./src/main/web/node_modules","./src/main/web/jnpm.kson")
                        .autoJNPM(true)
                        .hmr(DEVMODE) // support required for hot reloading, insert 'false' to turn of (re-enables browser breakpoints)
                )
                .allDev(DEVMODE)
                .jsPostProcessors(new ClojureJSPostProcessor()) // uses google clojure transpiler to ES5 (PRODMODE only)
                // (PRODMODE only: look (and create if not present) static build artefact for bundled index.html [avoids rebundling on first request in prodmode]
                // Warning: you need to delete this file in order to force a rebuild then
                .productionBuildDir(new File("./dist") )
                .buildResourcePath()
            .httpAPI("/api", app) // could also be websocket based (see IntrinsicReactJSX github project)
                .serType(SerializerType.JsonNoRef)
                .setSessionTimeout(TimeUnit.MINUTES.toMillis(cfg.getSessionTimeoutMinutes() ))
                .buildHttpApi()
            .hmrServer(DEVMODE) // hot reloading file tracking server
            .build();

    }

}
