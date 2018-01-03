package mypackage;

import io.undertow.util.HeaderMap;
import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.IPromise;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.remoting.encoding.SerializerType;
import org.nustaq.kontraktor.remoting.http.undertow.Http4K;
import org.nustaq.kontraktor.util.Log;

import java.io.File;

public class HttpService extends Actor<HttpService> {

    public static HttpServiceConfig cfg;

    public static void main(String[] args) {

        if ( ! new File("./run/etc/config.kson").exists() ) {
            System.out.println("please start with working dir [..]/httpservice");
            System.exit(1);
        }

        HttpService.cfg = HttpServiceConfig.read("./run/etc/config.kson");

        HttpService app = AsActor(HttpService.class);
        app.init().then( () -> {
            Log.Info(HttpService.class,"starting http service at " + cfg.getBindIp() + ":" + cfg.getBindPort());
            Http4K.Build(cfg.getBindIp(), cfg.getBindPort())
                .restAPI("/rest", app, headermap -> app.requestAuth(headermap))
                .httpAPI("/api", app)
                    .serType(SerializerType.JsonNoRef)
                    .buildHttpApi()
                .build();
        });

    }

    /////////////////////////////////////////////////////////
    // rest api

    @Local public IPromise init() {
        return resolve();
    }

    // see kontraktor wiki on how rest requests are mapped to methods

    /////////////////////////////////////////////////////////
    // kontraktor/json api

    @Local public IPromise requestAuth(HeaderMap headermap) {
        return resolve(null); // null == OK
    }

    public IPromise<String> greet( String name ) {
        return new Promise("hello "+name);
    }


}