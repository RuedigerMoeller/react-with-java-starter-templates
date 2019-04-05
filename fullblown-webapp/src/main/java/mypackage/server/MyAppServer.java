package mypackage.server;

import org.nustaq.kontraktor.*;
import org.nustaq.kontraktor.annotations.CallerSideMethod;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.apputil.*;
import org.nustaq.kontraktor.impl.SimpleScheduler;
import org.nustaq.kontraktor.remoting.encoding.Coding;
import org.nustaq.kontraktor.remoting.encoding.SerializerType;
import org.nustaq.kontraktor.remoting.http.undertow.Http4K;
import org.nustaq.kontraktor.services.rlclient.DataClient;
import org.nustaq.kontraktor.webapp.javascript.clojure.ClojureJSPostProcessor;
import org.nustaq.kontraktor.webapp.transpiler.JSXIntrinsicTranspiler;
import org.nustaq.reallive.messages.*;
import org.nustaq.reallive.records.MapRecord;

import java.io.File;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

public class MyAppServer extends Actor<MyAppServer> implements SessionHandlingMixin<MyAppServer>, RegistrationMixin<MyAppServer> {

    public static MyAppServerConfig cfg;

    // threads to dispatch session onto
    private Scheduler clientThreads[];
    private Random rand = new Random();
    private MyAppServerService service;
    private DataClient dclient;

    @Local
    public void init(String args[]) {
        clientThreads = new Scheduler[cfg.getNumSessionThreads()];
        IntStream.range(0,cfg.getNumSessionThreads())
            .forEach( i -> clientThreads[i] = new SimpleScheduler(10000, true /*Important!*/ ));
        service = MyAppServerService.start(args);
        service.setWebServer(self());
        dclient = service.getDClient();
    }

    @CallerSideMethod
    public DataClient getDClient() {
        return getActor().dclient;
    }


    ////////////////////// Session handling //////////////////////////////////////////////

    public IPromise login(String email, String pwd, Callback events ) {
        if ( "".equals(email.trim()) ) {
            return reject("empty email");
        }
        Promise p = new Promise();
        getDClient().tbl(UserTableName).get(email.toLowerCase()).then( (r,e) -> {
            if ( r != null ) {
                UserRecord user = new UserRecord(r);
                if ( pwd.equals(user.getPwd()) ) {
                    MyAppSession session = AsActor(
                        MyAppSession.class,
                        // randomly distribute session actors among clientThreads
                        clientThreads[rand.nextInt(clientThreads.length)]
                    );
                    session.init(user,self(),events);
                    p.resolve(new LoginData().session(session).user(user)); // == new Promise(session)
                } else {
                    p.reject("wrong user or password");
                }
            } else {
                p.reject("wrong user or password");
            }
        });
        return p;
    }


    ///////////////////// config and startup ////////////////////////////////////////////

    public static void main(String[] args) throws InterruptedException {

        if ( ! new File("./src/main/web/index.html").exists() ) {
            System.out.println("Please run with project working dir");
            System.exit(-1);
        }

        // separate&remove for distributed / clustered setup
        MyAppDataClusterStartup.main(new String[0]);

        MyAppServerConfig cfg = MyAppServerConfig.read("./run/etc/config.kson");
        MyAppServer.cfg = cfg;

        boolean DEVMODE = cfg.isDevMode();

        MyAppServer app = AsActor(MyAppServer.class);
        app.init(new String[] { "-sp", ""+5678, "-monitorport", "8082" } /*args*/);

        Mailer.DEBUG_MAIL = cfg.isDevMode();
        try {
            MailCfg mc = MailCfg.read("./run/etc/mailcfg.kson");
            Mailer.initSingleton( mc,cfg.publicUrl );
        } catch (Exception e) {
            e.printStackTrace();
            Mailer.initSingleton( new MailCfg(),cfg.publicUrl );
        }

        Class CLAZZES[] = {
            LoginData.class,
            MapRecord.class,
            AddMessage.class,
            UpdateMessage.class,
            RemoveMessage.class,
            QueryDoneMessage.class,
            SessionEvent.class,
            Diff.class,
        };

        Http4K.Build(cfg.getBindIp(), cfg.getBindPort())
            .fileRoot( "imgupload","./run/upload/image")
            .fileRoot( "img","./run/data/img")
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
                .coding(new Coding(SerializerType.JsonNoRef, CLAZZES))
                .setSessionTimeout(TimeUnit.MINUTES.toMillis(cfg.getSessionTimeoutMinutes() ))
                .buildHttpApi()
            .hmrServer(DEVMODE) // hot reloading file tracking server
            .auto(app,RegistrationMixin.class)
            .build();

    }

}
