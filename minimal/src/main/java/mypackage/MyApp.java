package mypackage;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.IPromise;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.remoting.encoding.SerializerType;
import org.nustaq.kontraktor.remoting.http.undertow.Http4K;
import org.nustaq.kontraktor.webapp.javascript.clojure.ClojureJSPostProcessor;
import org.nustaq.kontraktor.webapp.transpiler.JSXIntrinsicTranspiler;

import java.io.File;

// DISCLAMER we are node-style single threaded here. Use 'execInThreadPool' to do thread blocking ops such as IO / Database
// only IPromise and void returning public methods are allowed
public class MyApp extends Actor<MyApp> {

    @Local
    public void init() {
    }

    public IPromise greet(String who) {
        return resolve("Hello "+who);
    }

    public static void main(String[] args) {
        boolean DEVMODE = true;

        if ( ! new File("./src/main/web/index.html").exists() ) {
            System.out.println("Please run with working dir: '[..]/minimal");
            System.exit(-1);
        }

        MyApp app = AsActor(MyApp.class);
        app.init();

        Http4K.Build("localhost", 8080)
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
                // (PRODMODE only: look (and create if not present) static build artefact for budled index.html [avoids rebundling on first request in prodmode]
                // Warning: you need to delete this file in order to force a rebuild then
                .productionBuildDir(new File("./dist") )
                .buildResourcePath()
            .httpAPI("/api", app)
                .serType(SerializerType.JsonNoRef)
                .buildHttpApi()
            .hmrServer(DEVMODE) // hot reloading file tracking server
            .build();

    }
}
