package mypackage;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.IPromise;
import org.nustaq.kontraktor.remoting.encoding.SerializerType;
import org.nustaq.kontraktor.remoting.http.undertow.Http4K;
import org.nustaq.kontraktor.util.Log;

import java.io.File;

public class WebsocketService extends Actor<WebsocketService> {

    public static WebsocketServiceConfig cfg;

    public static void main(String[] args) {

        if ( ! new File("./run/etc/config.kson").exists() ) {
            System.out.println("please start with working dir [..]/websocketservice");
            System.exit(1);
        }

        WebsocketService.cfg = WebsocketServiceConfig.read("./run/etc/config.kson");

        WebsocketService app = AsActor(WebsocketService.class);
        app.init().then( () -> {
            Log.Info(WebsocketService.class,"starting websocketservice at " + cfg.getBindIp() + ":" + cfg.getBindPort());
            Http4K.Build(cfg.getBindIp(), cfg.getBindPort())
                .websocket("/ws", app)
                .serType(SerializerType.JsonNoRef)
                .buildWebsocket()
                .build();
        });

    }

    public IPromise init() {
        return resolve();
    }


}